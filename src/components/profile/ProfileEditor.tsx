import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Upload, Plus, X, Edit2, Check, Loader2 } from "lucide-react";
import { ProfileStyleType } from "./ProfileStyleSelector";
import { ProfilePreview } from "./ProfilePreview";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as SocialIcons from "react-icons/si";
import * as BrandIcons from "react-icons/fa";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProfileButton {
  id: string;
  label: string;
  url: string;
  icon: string;
}

interface ProfileEditorProps {
  styleType: ProfileStyleType;
  onBack: () => void;
  onComplete: () => void;
}

const iconList = [
  // Social Media
  { name: "Facebook", icon: "FaFacebook" },
  { name: "Twitter", icon: "FaTwitter" },
  { name: "Instagram", icon: "FaInstagram" },
  { name: "LinkedIn", icon: "FaLinkedin" },
  { name: "GitHub", icon: "FaGithub" },
  { name: "YouTube", icon: "FaYoutube" },
  { name: "TikTok", icon: "SiTiktok" },
  { name: "WhatsApp", icon: "FaWhatsapp" },
  { name: "Telegram", icon: "FaTelegram" },
  { name: "Discord", icon: "FaDiscord" },
  { name: "Snapchat", icon: "FaSnapchat" },
  { name: "Spotify", icon: "FaSpotify" },
  { name: "Twitch", icon: "FaTwitch" },
  { name: "Reddit", icon: "FaReddit" },
  { name: "Pinterest", icon: "FaPinterest" },
  { name: "Medium", icon: "FaMedium" },
  { name: "Tumblr", icon: "FaTumblr" },
  { name: "Vimeo", icon: "FaVimeo" },
  { name: "SoundCloud", icon: "FaSoundcloud" },
  { name: "Behance", icon: "FaBehance" },
  { name: "Dribbble", icon: "FaDribbble" },
  { name: "Slack", icon: "FaSlack" },
  { name: "Skype", icon: "FaSkype" },
  { name: "WeChat", icon: "FaWeixin" },
  { name: "Line", icon: "FaLine" },
  { name: "Viber", icon: "FaViber" },
  { name: "VK", icon: "FaVk" },
  { name: "Weibo", icon: "FaWeibo" },
  { name: "QQ", icon: "FaQq" },
  { name: "Meetup", icon: "FaMeetup" },
  
  // Messaging & Communication
  { name: "Email", icon: "FaEnvelope" },
  { name: "Phone", icon: "FaPhone" },
  { name: "Message", icon: "FaComment" },
  { name: "Chat", icon: "FaComments" },
  { name: "Video Call", icon: "FaVideo" },
  { name: "Voice", icon: "FaMicrophone" },
  
  // Professional
  { name: "Portfolio", icon: "FaBriefcase" },
  { name: "Resume", icon: "FaFileAlt" },
  { name: "Certificate", icon: "FaCertificate" },
  { name: "Award", icon: "FaTrophy" },
  { name: "Project", icon: "FaProjectDiagram" },
  
  // E-commerce & Business
  { name: "Shopping", icon: "FaShoppingCart" },
  { name: "Store", icon: "FaStore" },
  { name: "Product", icon: "FaBox" },
  { name: "Payment", icon: "FaCreditCard" },
  { name: "PayPal", icon: "FaPaypal" },
  { name: "Stripe", icon: "FaStripe" },
  { name: "Bitcoin", icon: "FaBitcoin" },
  { name: "Ethereum", icon: "FaEthereum" },
  
  // Entertainment
  { name: "Music", icon: "FaMusic" },
  { name: "Podcast", icon: "FaPodcast" },
  { name: "Film", icon: "FaFilm" },
  { name: "Camera", icon: "FaCamera" },
  { name: "Gaming", icon: "FaGamepad" },
  { name: "Steam", icon: "FaSteam" },
  { name: "PlayStation", icon: "FaPlaystation" },
  { name: "Xbox", icon: "FaXbox" },
  
  // Food & Travel
  { name: "Restaurant", icon: "FaUtensils" },
  { name: "Coffee", icon: "FaCoffee" },
  { name: "Pizza", icon: "FaPizzaSlice" },
  { name: "Travel", icon: "FaPlane" },
  { name: "Hotel", icon: "FaHotel" },
  { name: "Map", icon: "FaMapMarkedAlt" },
  
  // Health & Fitness
  { name: "Health", icon: "FaHeartbeat" },
  { name: "Medical", icon: "FaMedkit" },
  { name: "Fitness", icon: "FaDumbbell" },
  { name: "Running", icon: "FaRunning" },
  { name: "Cycling", icon: "FaBiking" },
  
  // Education
  { name: "Book", icon: "FaBook" },
  { name: "School", icon: "FaSchool" },
  { name: "University", icon: "FaUniversity" },
  { name: "Graduation", icon: "FaGraduationCap" },
  { name: "Study", icon: "FaUserGraduate" },
  { name: "Pen", icon: "FaPen" },
  
  // Technology
  { name: "Code", icon: "FaCode" },
  { name: "Terminal", icon: "FaTerminal" },
  { name: "Database", icon: "FaDatabase" },
  { name: "Server", icon: "FaServer" },
  { name: "Cloud", icon: "FaCloud" },
  { name: "Mobile", icon: "FaMobileAlt" },
  { name: "Laptop", icon: "FaLaptop" },
  { name: "Desktop", icon: "FaDesktop" },
  { name: "Tablet", icon: "FaTabletAlt" },
  { name: "Keyboard", icon: "FaKeyboard" },
  { name: "Mouse", icon: "FaMouse" },
  { name: "Wifi", icon: "FaWifi" },
  { name: "Bluetooth", icon: "FaBluetooth" },
  { name: "USB", icon: "FaUsb" },
  { name: "Battery", icon: "FaBatteryFull" },
  { name: "Plug", icon: "FaPlug" },
  
  // Documents & Files
  { name: "File", icon: "FaFile" },
  { name: "Document", icon: "FaFileWord" },
  { name: "PDF", icon: "FaFilePdf" },
  { name: "Excel", icon: "FaFileExcel" },
  { name: "PowerPoint", icon: "FaFilePowerpoint" },
  { name: "Image", icon: "FaFileImage" },
  { name: "Video", icon: "FaFileVideo" },
  { name: "Audio", icon: "FaFileAudio" },
  { name: "Archive", icon: "FaFileArchive" },
  { name: "Code File", icon: "FaFileCode" },
  
  // General & Utility
  { name: "Website", icon: "FaGlobe" },
  { name: "Link", icon: "FaLink" },
  { name: "Home", icon: "FaHome" },
  { name: "User", icon: "FaUser" },
  { name: "Users", icon: "FaUsers" },
  { name: "Calendar", icon: "FaCalendar" },
  { name: "Clock", icon: "FaClock" },
  { name: "Bell", icon: "FaBell" },
  { name: "Star", icon: "FaStar" },
  { name: "Heart", icon: "FaHeart" },
  { name: "Bookmark", icon: "FaBookmark" },
  { name: "Tag", icon: "FaTag" },
  { name: "Search", icon: "FaSearch" },
  { name: "Settings", icon: "FaCog" },
  { name: "Tools", icon: "FaTools" },
  { name: "Download", icon: "FaDownload" },
  { name: "Upload", icon: "FaUpload" },
  { name: "Share", icon: "FaShare" },
  { name: "Info", icon: "FaInfoCircle" },
  { name: "Question", icon: "FaQuestionCircle" },
  { name: "Exclamation", icon: "FaExclamationCircle" },
  { name: "Check", icon: "FaCheckCircle" },
  { name: "Times", icon: "FaTimesCircle" },
  { name: "Plus", icon: "FaPlusCircle" },
  { name: "Minus", icon: "FaMinusCircle" },
  { name: "Arrow Up", icon: "FaArrowUp" },
  { name: "Arrow Down", icon: "FaArrowDown" },
  { name: "Arrow Left", icon: "FaArrowLeft" },
  { name: "Arrow Right", icon: "FaArrowRight" },
  { name: "Chevron Up", icon: "FaChevronUp" },
  { name: "Chevron Down", icon: "FaChevronDown" },
  { name: "Chevron Left", icon: "FaChevronLeft" },
  { name: "Chevron Right", icon: "FaChevronRight" },
  
  // Location & Transportation
  { name: "Location", icon: "FaMapMarkerAlt" },
  { name: "Navigation", icon: "FaCompass" },
  { name: "Car", icon: "FaCar" },
  { name: "Bus", icon: "FaBus" },
  { name: "Train", icon: "FaTrain" },
  { name: "Subway", icon: "FaSubway" },
  { name: "Ship", icon: "FaShip" },
  { name: "Rocket", icon: "FaRocket" },
  { name: "Helicopter", icon: "FaHelicopter" },
  
  // Weather & Nature
  { name: "Sun", icon: "FaSun" },
  { name: "Moon", icon: "FaMoon" },
  { name: "Cloud Sun", icon: "FaCloudSun" },
  { name: "Cloud Moon", icon: "FaCloudMoon" },
  { name: "Rain", icon: "FaCloudRain" },
  { name: "Snow", icon: "FaSnowflake" },
  { name: "Wind", icon: "FaWind" },
  { name: "Bolt", icon: "FaBolt" },
  { name: "Tree", icon: "FaTree" },
  { name: "Leaf", icon: "FaLeaf" },
  { name: "Seedling", icon: "FaSeedling" },
  { name: "Mountain", icon: "FaMountain" },
  { name: "Water", icon: "FaWater" },
  { name: "Fire", icon: "FaFire" },
  
  // Animals
  { name: "Dog", icon: "FaDog" },
  { name: "Cat", icon: "FaCat" },
  { name: "Horse", icon: "FaHorse" },
  { name: "Fish", icon: "FaFish" },
  { name: "Frog", icon: "FaFrog" },
  { name: "Dove", icon: "FaDove" },
  { name: "Crow", icon: "FaCrow" },
  { name: "Dragon", icon: "FaDragon" },
  { name: "Spider", icon: "FaSpider" },
  { name: "Paw", icon: "FaPaw" },
  
  // Emoji & Faces
  { name: "Smile", icon: "FaSmile" },
  { name: "Laugh", icon: "FaLaugh" },
  { name: "Grin", icon: "FaGrin" },
  { name: "Meh", icon: "FaMeh" },
  { name: "Frown", icon: "FaFrown" },
  { name: "Sad Tear", icon: "FaSadTear" },
  { name: "Angry", icon: "FaAngry" },
  { name: "Dizzy", icon: "FaDizzy" },
  { name: "Kiss", icon: "FaKiss" },
  { name: "Tired", icon: "FaTired" },
  { name: "Surprise", icon: "FaSurprise" },
  
  // Symbols
  { name: "Infinity", icon: "FaInfinity" },
  { name: "Percentage", icon: "FaPercent" },
  { name: "Dollar", icon: "FaDollarSign" },
  { name: "Euro", icon: "FaEuroSign" },
  { name: "Pound", icon: "FaPoundSign" },
  { name: "Yen", icon: "FaYenSign" },
  { name: "Rupee", icon: "FaRupeeSign" },
  { name: "Crown", icon: "FaCrown" },
  { name: "Shield", icon: "FaShield" },
  { name: "Key", icon: "FaKey" },
  { name: "Lock", icon: "FaLock" },
  { name: "Unlock", icon: "FaUnlock" },
  { name: "Eye", icon: "FaEye" },
  { name: "Eye Slash", icon: "FaEyeSlash" },
  { name: "Fingerprint", icon: "FaFingerprint" },
  { name: "Handshake", icon: "FaHandshake" },
  { name: "Thumbs Up", icon: "FaThumbsUp" },
  { name: "Thumbs Down", icon: "FaThumbsDown" },
  { name: "Peace", icon: "FaPeace" },
  { name: "Yin Yang", icon: "FaYinYang" },
  
  // Brands (Tech Companies)
  { name: "Apple", icon: "FaApple" },
  { name: "Microsoft", icon: "FaMicrosoft" },
  { name: "Google", icon: "FaGoogle" },
  { name: "Amazon", icon: "FaAmazon" },
  { name: "Android", icon: "FaAndroid" },
  { name: "Windows", icon: "FaWindows" },
  { name: "Linux", icon: "FaLinux" },
  { name: "Ubuntu", icon: "FaUbuntu" },
  { name: "Chrome", icon: "FaChrome" },
  { name: "Firefox", icon: "FaFirefox" },
  { name: "Safari", icon: "FaSafari" },
  { name: "Edge", icon: "FaEdge" },
  { name: "Opera", icon: "FaOpera" },
  
  // Programming Languages & Tools
  { name: "React", icon: "FaReact" },
  { name: "Angular", icon: "FaAngular" },
  { name: "Vue", icon: "FaVuejs" },
  { name: "Node.js", icon: "FaNodeJs" },
  { name: "Python", icon: "FaPython" },
  { name: "Java", icon: "FaJava" },
  { name: "JavaScript", icon: "FaJs" },
  { name: "HTML5", icon: "FaHtml5" },
  { name: "CSS3", icon: "FaCss3" },
  { name: "PHP", icon: "FaPhp" },
  { name: "Swift", icon: "FaSwift" },
  { name: "Laravel", icon: "FaLaravel" },
  { name: "Symfony", icon: "FaSymfony" },
  { name: "WordPress", icon: "FaWordpress" },
  { name: "Drupal", icon: "FaDrupal" },
  { name: "Joomla", icon: "FaJoomla" },
  { name: "Magento", icon: "FaMagento" },
  { name: "Shopify", icon: "FaShopify" },
  { name: "WooCommerce", icon: "FaWix" },
  { name: "SquareSpace", icon: "FaSquarespace" },
  { name: "Git", icon: "FaGitAlt" },
  { name: "GitLab", icon: "FaGitlab" },
  { name: "Bitbucket", icon: "FaBitbucket" },
  { name: "Stack Overflow", icon: "FaStackOverflow" },
  { name: "npm", icon: "FaNpm" },
  { name: "Yarn", icon: "FaYarn" },
  { name: "Docker", icon: "FaDocker" },
  { name: "Jenkins", icon: "FaJenkins" },
  { name: "Sass", icon: "FaSass" },
  { name: "Less", icon: "FaLess" },
  { name: "Gulp", icon: "FaGulp" },
  { name: "Grunt", icon: "FaGrunt" },
  { name: "Webpack", icon: "SiWebpack" },
  { name: "Babel", icon: "SiBabel" },
  { name: "TypeScript", icon: "SiTypescript" },
  { name: "GraphQL", icon: "SiGraphql" },
  { name: "MongoDB", icon: "SiMongodb" },
  { name: "PostgreSQL", icon: "SiPostgresql" },
  { name: "MySQL", icon: "SiMysql" },
  { name: "Redis", icon: "SiRedis" },
  { name: "Firebase", icon: "SiFirebase" },
  { name: "Heroku", icon: "SiHeroku" },
  { name: "DigitalOcean", icon: "SiDigitalocean" },
  { name: "Netlify", icon: "SiNetlify" },
  { name: "Vercel", icon: "SiVercel" },
  
  // Delivery & Food Services
  { name: "Uber", icon: "FaUber" },
  { name: "Lyft", icon: "FaLyft" },
  { name: "Airbnb", icon: "FaAirbnb" },
  
  // News & Media
  { name: "RSS", icon: "FaRss" },
  { name: "Newspaper", icon: "FaNewspaper" },
  { name: "Microphone", icon: "FaMicrophone" },
  { name: "Broadcast", icon: "FaBroadcastTower" },
  
  // Sports & Recreation
  { name: "Football", icon: "FaFootballBall" },
  { name: "Basketball", icon: "FaBasketballBall" },
  { name: "Baseball", icon: "FaBaseballBall" },
  { name: "Volleyball", icon: "FaVolleyballBall" },
  { name: "Tennis", icon: "FaTableTennis" },
  { name: "Golf", icon: "FaGolfBall" },
  { name: "Hockey", icon: "FaHockeyPuck" },
  { name: "Bowling", icon: "FaBowlingBall" },
  { name: "Skiing", icon: "FaSkiing" },
  { name: "Swimming", icon: "FaSwimmer" },
  
  // Office & Work
  { name: "Clipboard", icon: "FaClipboard" },
  { name: "Folder", icon: "FaFolder" },
  { name: "Folder Open", icon: "FaFolderOpen" },
  { name: "Copy", icon: "FaCopy" },
  { name: "Cut", icon: "FaCut" },
  { name: "Paste", icon: "FaPaste" },
  { name: "Save", icon: "FaSave" },
  { name: "Print", icon: "FaPrint" },
  { name: "Fax", icon: "FaFax" },
  { name: "Calculator", icon: "FaCalculator" },
  { name: "Chart Line", icon: "FaChartLine" },
  { name: "Chart Bar", icon: "FaChartBar" },
  { name: "Chart Pie", icon: "FaChartPie" },
  { name: "Table", icon: "FaTable" },
  { name: "Tasks", icon: "FaTasks" },
  { name: "List", icon: "FaList" },
  { name: "Bullseye", icon: "FaBullseye" },
  { name: "Crosshairs", icon: "FaCrosshairs" },
  
  // Medical & Science
  { name: "Syringe", icon: "FaSyringe" },
  { name: "Pills", icon: "FaPills" },
  { name: "Thermometer", icon: "FaThermometer" },
  { name: "Stethoscope", icon: "FaStethoscope" },
  { name: "Microscope", icon: "FaMicroscope" },
  { name: "Flask", icon: "FaFlask" },
  { name: "Atom", icon: "FaAtom" },
  { name: "DNA", icon: "FaDna" },
  { name: "Virus", icon: "FaVirus" },
  { name: "Bacteria", icon: "FaBacteria" },
  
  // Security & Safety
  { name: "Shield Alt", icon: "FaShieldAlt" },
  { name: "User Shield", icon: "FaUserShield" },
  { name: "Lock Open", icon: "FaLockOpen" },
  { name: "User Lock", icon: "FaUserLock" },
  { name: "ID Card", icon: "FaIdCard" },
  { name: "ID Badge", icon: "FaIdBadge" },
  { name: "Passport", icon: "FaPassport" },
  { name: "Hard Hat", icon: "FaHardHat" },
  { name: "Fire Extinguisher", icon: "FaFireExtinguisher" },
  { name: "First Aid", icon: "FaFirstAid" },
  
  // Fashion & Accessories
  { name: "Tshirt", icon: "FaTshirt" },
  { name: "Hat", icon: "FaHatCowboy" },
  { name: "Glasses", icon: "FaGlasses" },
  { name: "Ring", icon: "FaRing" },
  { name: "Watch", icon: "FaClock" },
  { name: "Shoe", icon: "FaShoePrints" },
  { name: "Mitten", icon: "FaMitten" },
  { name: "Socks", icon: "FaSocks" },
  
  // Religion & Culture
  { name: "Cross", icon: "FaCross" },
  { name: "Star of David", icon: "FaStarOfDavid" },
  { name: "Om", icon: "FaOm" },
  { name: "Praying Hands", icon: "FaPrayingHands" },
  { name: "Mosque", icon: "FaMosque" },
  { name: "Church", icon: "FaChurch" },
  { name: "Synagogue", icon: "FaSynagogue" },
  { name: "Kaaba", icon: "FaKaaba" },
  { name: "Torii Gate", icon: "FaToriiGate" },
  { name: "Menorah", icon: "FaMenorah" },
  
  // Misc Icons
  { name: "Magic", icon: "FaMagic" },
  { name: "Wand", icon: "FaWandMagic" },
  { name: "Gift", icon: "FaGift" },
  { name: "Birthday Cake", icon: "FaBirthdayCake" },
  { name: "Candy", icon: "FaCandyCane" },
  { name: "Ice Cream", icon: "FaIceCream" },
  { name: "Cookie", icon: "FaCookie" },
  { name: "Cheese", icon: "FaCheese" },
  { name: "Hamburger", icon: "FaHamburger" },
  { name: "Hotdog", icon: "FaHotdog" },
  { name: "Carrot", icon: "FaCarrot" },
  { name: "Apple Alt", icon: "FaAppleAlt" },
  { name: "Lemon", icon: "FaLemon" },
  { name: "Pepper", icon: "FaPepperHot" },
  { name: "Egg", icon: "FaEgg" },
  { name: "Drumstick", icon: "FaDrumstickBite" },
  { name: "Bacon", icon: "FaBacon" },
  { name: "Bread", icon: "FaBreadSlice" },
  { name: "Wine", icon: "FaWineGlass" },
  { name: "Beer", icon: "FaBeer" },
  { name: "Cocktail", icon: "FaCocktail" },
  { name: "Blender", icon: "FaBlender" },
  { name: "Glass", icon: "FaGlassWhiskey" },
  { name: "Mug", icon: "FaMugHot" },
  { name: "Toilet Paper", icon: "FaToiletPaper" },
  { name: "Toilet", icon: "FaToilet" },
  { name: "Bath", icon: "FaBath" },
  { name: "Shower", icon: "FaShower" },
  { name: "Bed", icon: "FaBed" },
  { name: "Couch", icon: "FaCouch" },
  { name: "Chair", icon: "FaChair" },
  { name: "Door", icon: "FaDoorOpen" },
  { name: "Lightbulb", icon: "FaLightbulb" },
  { name: "Fan", icon: "FaFan" },
  { name: "Snowplow", icon: "FaSnowplow" },
  { name: "Broom", icon: "FaBroom" },
  { name: "Spray", icon: "FaSprayCan" },
  { name: "Paint Brush", icon: "FaPaintBrush" },
  { name: "Paint Roller", icon: "FaPaintRoller" },
  { name: "Hammer", icon: "FaHammer" },
  { name: "Wrench", icon: "FaWrench" },
  { name: "Screwdriver", icon: "FaScrewdriver" },
  { name: "Toolbox", icon: "FaToolbox" },
];

export const ProfileEditor = ({ styleType, onBack, onComplete }: ProfileEditorProps) => {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [backgroundType, setBackgroundType] = useState<"color" | "image">("color");
  const [backgroundColor, setBackgroundColor] = useState("#1a1a1a");
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string>("");
  const [title, setTitle] = useState("مرحباً بك");
  const [description, setDescription] = useState("هذا هو البروفايل الخاص بي");
  const [buttons, setButtons] = useState<ProfileButton[]>([]);
  const [footerText, setFooterText] = useState("");
  const [creating, setCreating] = useState(false);
  
  const [showTitleDialog, setShowTitleDialog] = useState(false);
  const [showDescDialog, setShowDescDialog] = useState(false);
  const [showButtonDialog, setShowButtonDialog] = useState(false);
  const [showIconDialog, setShowIconDialog] = useState(false);
  const [showBackgroundDialog, setShowBackgroundDialog] = useState(false);
  const [editingButton, setEditingButton] = useState<ProfileButton | null>(null);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const checkUsername = async (value: string) => {
    if (value.length < 3 || !/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      // Check username in profile_projects
      const { data: profileData, error: profileError } = await supabase
        .from("profile_projects")
        .select("username")
        .eq("username", value)
        .maybeSingle();

      if (profileError) throw profileError;
      
      // Check url_slug in projects (with @ prefix)
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("url_slug")
        .eq("url_slug", `@${value}`)
        .maybeSingle();

      if (projectError) throw projectError;
      
      setUsernameAvailable(!profileData && !projectData);
    } catch (error) {
      console.error("Error checking username:", error);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    checkUsername(value);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackgroundImage(file);
      setBackgroundImagePreview(URL.createObjectURL(file));
      setBackgroundType("image");
    }
  };

  const addButton = () => {
    setEditingButton({ id: Date.now().toString(), label: "", url: "", icon: "FaLink" });
    setShowButtonDialog(true);
  };

  const saveButton = () => {
    if (editingButton && editingButton.label && editingButton.url) {
      if (buttons.find((b) => b.id === editingButton.id)) {
        setButtons(buttons.map((b) => (b.id === editingButton.id ? editingButton : b)));
      } else {
        setButtons([...buttons, editingButton]);
      }
      setShowButtonDialog(false);
      setEditingButton(null);
    }
  };

  const removeButton = (id: string) => {
    setButtons(buttons.filter((b) => b.id !== id));
  };

  const selectIcon = (icon: string) => {
    if (editingButton) {
      setEditingButton({ ...editingButton, icon });
    }
    setShowIconDialog(false);
  };

  const handlePayment = async () => {
    if (!username || !usernameAvailable) {
      toast({ title: "خطأ", description: "يرجى اختيار اسم مستخدم صالح ومتاح", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Prepare profile data
      const profileData = {
        username,
        style_type: styleType,
        avatar_url: avatarPreview,
        avatar_file: avatar?.name,
        avatar_preview: avatarPreview,
        background_type: backgroundType,
        background_value: backgroundType === "color" ? backgroundColor : "",
        background_file: backgroundImage?.name,
        background_preview: backgroundType === "image" ? backgroundImagePreview : "",
        title,
        description,
        buttons,
        footer_text: footerText,
      };

      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          amount: 1.00,
          currency: "USD",
          status: "pending",
          payment_method: "paypal",
          profile_data: profileData as any,
        } as any)
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Redirect to PayPal
      const returnUrl = `${window.location.origin}/checkout?payment_id=${payment.id}`;
      const cancelUrl = `${window.location.origin}/dashboard`;
      const notifyUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paypal-ipn`;
      
      const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?` +
        `cmd=_xclick` +
        `&business=tpnaltbn@gmail.com` +
        `&item_name=Profile Creation` +
        `&amount=1.00` +
        `&currency_code=USD` +
        `&custom=${payment.id}` +
        `&notify_url=${encodeURIComponent(notifyUrl)}` +
        `&return=${encodeURIComponent(returnUrl)}` +
        `&cancel_return=${encodeURIComponent(cancelUrl)}` +
        `&no_shipping=1`;

      // Open PayPal in same window
      window.location.href = paypalUrl;

    } catch (error: any) {
      console.error("Error creating payment:", error);
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
      setCreating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <Card className="p-6 space-y-6 h-fit">
        <h3 className="text-2xl font-bold">إعدادات البروفايل</h3>

        <div className="space-y-2">
          <Label>اسم المستخدم</Label>
          <div className="flex items-center gap-2">
            <Input
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="username"
              className="font-mono flex-1"
              dir="ltr"
            />
            <div className="w-6 h-6 flex items-center justify-center">
              {checkingUsername && (
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              )}
              {!checkingUsername && usernameAvailable === true && (
                <Check className="w-5 h-5 text-green-500" />
              )}
              {!checkingUsername && usernameAvailable === false && (
                <X className="w-5 h-5 text-red-500" />
              )}
            </div>
          </div>
          {username && username.length >= 3 && usernameAvailable === false && (
            <p className="text-sm text-red-500">اسم المستخدم غير متاح</p>
          )}
          {username && username.length < 3 && (
            <p className="text-sm text-muted-foreground">3 أحرف على الأقل</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>صورة البروفايل</Label>
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors overflow-hidden"
              onClick={() => avatarInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <Button variant="outline" onClick={() => avatarInputRef.current?.click()}>
              رفع صورة
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>الخلفية</Label>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowBackgroundDialog(true)}
          >
            {backgroundType === "color" ? "لون خالص" : "صورة خلفية"}
          </Button>
        </div>

        <div className="space-y-2">
          <Label>العنوان</Label>
          <div className="flex gap-2">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowTitleDialog(true)}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>الوصف</Label>
          <div className="flex gap-2">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowDescDialog(true)}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>الأزرار</Label>
          <div className="space-y-2">
            {buttons.map((button) => (
              <div key={button.id} className="flex items-center gap-2 p-2 border rounded-md">
                <span className="flex-1">{button.label}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingButton(button);
                    setShowButtonDialog(true);
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeButton(button.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={addButton}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة زر
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>نص الفوتر</Label>
          <Input value={footerText} onChange={(e) => setFooterText(e.target.value)} />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            رجوع
          </Button>
          <Button
            onClick={handlePayment}
            disabled={!username || !usernameAvailable || creating}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
            شراء الآن 1$
          </Button>
        </div>
      </Card>

      <div className="lg:sticky lg:top-6 h-fit">
        <ProfilePreview
          styleType={styleType}
          avatar={avatarPreview}
          backgroundType={backgroundType}
          backgroundColor={backgroundColor}
          backgroundImage={backgroundImagePreview}
          title={title}
          description={description}
          buttons={buttons}
          footerText={footerText}
        />
      </div>

      <Dialog open={showBackgroundDialog} onOpenChange={setShowBackgroundDialog}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle>اختر الخلفية</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>اللون</Label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => {
                  setBackgroundColor(e.target.value);
                  setBackgroundType("color");
                }}
                className="w-full h-32 rounded-md cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <Label>أو رفع صورة</Label>
              <input
                ref={bgInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBackgroundImageChange}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => bgInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 ml-2" />
                رفع صورة خلفية
              </Button>
              {backgroundImagePreview && (
                <img
                  src={backgroundImagePreview}
                  alt="Background"
                  className="w-full h-32 object-cover rounded-md"
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowBackgroundDialog(false)}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showButtonDialog} onOpenChange={setShowButtonDialog}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle>تعديل الزر</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>عنوان الزر</Label>
              <Input
                value={editingButton?.label || ""}
                onChange={(e) =>
                  setEditingButton(
                    editingButton ? { ...editingButton, label: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label>الرابط</Label>
              <Input
                value={editingButton?.url || ""}
                onChange={(e) =>
                  setEditingButton(
                    editingButton ? { ...editingButton, url: e.target.value } : null
                  )
                }
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>الأيقونة</Label>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowIconDialog(true)}
              >
                اختر أيقونة
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowButtonDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={saveButton}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showIconDialog} onOpenChange={setShowIconDialog}>
        <DialogContent className="max-w-2xl animate-scale-in">
          <DialogHeader>
            <DialogTitle>اختر أيقونة</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-96">
            <div className="grid grid-cols-5 gap-2">
              {iconList.map((iconItem) => {
                const IconComponent =
                  (BrandIcons as any)[iconItem.icon] ||
                  (SocialIcons as any)[iconItem.icon];
                return (
                  <Button
                    key={iconItem.icon}
                    variant="outline"
                    className="h-16 flex flex-col gap-1"
                    onClick={() => selectIcon(iconItem.icon)}
                  >
                    {IconComponent && <IconComponent className="w-6 h-6" />}
                    <span className="text-xs">{iconItem.name}</span>
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showTitleDialog} onOpenChange={setShowTitleDialog}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle>تعديل العنوان</DialogTitle>
          </DialogHeader>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          <DialogFooter>
            <Button onClick={() => setShowTitleDialog(false)}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDescDialog} onOpenChange={setShowDescDialog}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle>تعديل الوصف</DialogTitle>
          </DialogHeader>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          <DialogFooter>
            <Button onClick={() => setShowDescDialog(false)}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};