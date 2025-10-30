import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, userId, projectSlug } = await req.json();

    if (!projectId || !userId || !projectSlug) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const log = async (logType: string, message: string) => {
      console.log(`[${logType}] ${message}`);
      await supabase.from('console_logs').insert({
        project_id: projectId,
        log_type: logType,
        message: message,
      });
    };

    await log('info', '🚀 بدء تشغيل مشروع Python...');

    // Get project details
    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (!project) {
      await log('error', '❌ المشروع غير موجود');
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mainFilePath = project.main_file?.startsWith('/') ? project.main_file : `/${project.main_file}`;
    const storagePath = `${userId}/${projectSlug}${mainFilePath}`;

    await log('info', `📄 تحميل الملف الرئيسي: ${project.main_file}`);

    // Download main Python file
    const { data: mainFileData, error: mainFileError } = await supabase.storage
      .from('project-files')
      .download(storagePath);

    if (mainFileError || !mainFileData) {
      await log('error', `❌ فشل تحميل الملف الرئيسي: ${mainFileError?.message || 'File not found'}`);
      return new Response(
        JSON.stringify({ error: 'Main file not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const code = await mainFileData.text();

    // Create temp directory for project
    const tempDir = await Deno.makeTempDir();
    const mainFile = `${tempDir}/main.py`;
    await Deno.writeTextFile(mainFile, code);

    await log('info', '📦 التحقق من وجود ملف requirements.txt...');

    // Check for requirements.txt
    const reqPath = `${userId}/${projectSlug}/requirements.txt`;
    const { data: reqData, error: reqError } = await supabase.storage
      .from('project-files')
      .download(reqPath);

    if (!reqError && reqData) {
      const requirements = await reqData.text();
      const reqFile = `${tempDir}/requirements.txt`;
      await Deno.writeTextFile(reqFile, requirements);

      await log('info', '📥 تم العثور على requirements.txt، جاري تثبيت المكتبات...');
      await log('info', `المكتبات المطلوبة:\n${requirements}`);

      // Install requirements
      const pipCommand = new Deno.Command('pip3', {
        args: ['install', '-r', reqFile, '--user', '--quiet'],
        stdout: 'piped',
        stderr: 'piped',
      });

      const pipProcess = pipCommand.spawn();
      const { stdout: pipStdout, stderr: pipStderr } = await pipProcess.output();
      const pipStatus = await pipProcess.status;

      const decoder = new TextDecoder();
      const pipOutput = decoder.decode(pipStdout);
      const pipError = decoder.decode(pipStderr);

      if (pipStatus.success) {
        await log('success', '✅ تم تثبيت جميع المكتبات بنجاح');
        if (pipOutput.trim()) {
          await log('info', `تفاصيل التثبيت:\n${pipOutput}`);
        }
      } else {
        await log('error', `⚠️ فشل تثبيت بعض المكتبات:\n${pipError}`);
        if (pipOutput.trim()) {
          await log('info', pipOutput);
        }
      }
    } else {
      await log('info', 'ℹ️ لم يتم العثور على ملف requirements.txt');
    }

    await log('info', '▶️ بدء تنفيذ البرنامج...');

    // Execute Python code
    const pythonCommand = new Deno.Command('python3', {
      args: [mainFile],
      cwd: tempDir,
      stdout: 'piped',
      stderr: 'piped',
    });

    const pythonProcess = pythonCommand.spawn();
    const { stdout, stderr } = await pythonProcess.output();
    const status = await pythonProcess.status;

    // Clean up temp directory
    try {
      await Deno.remove(tempDir, { recursive: true });
    } catch (e) {
      console.error('Failed to remove temp directory:', e);
    }

    const decoder = new TextDecoder();
    const output = decoder.decode(stdout);
    const error = decoder.decode(stderr);

    if (status.success) {
      await log('success', '✅ تم تنفيذ البرنامج بنجاح');
      if (output.trim()) {
        await log('output', `📤 الناتج:\n${output}`);
      }
    } else {
      await log('error', `❌ فشل تنفيذ البرنامج (Exit Code: ${status.code})`);
      if (error.trim()) {
        await log('error', `الأخطاء:\n${error}`);
      }
    }

    await log('info', '🏁 انتهى التنفيذ');

    return new Response(
      JSON.stringify({
        success: status.success,
        output: output || '',
        error: error || '',
        exitCode: status.code,
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error executing Python:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
