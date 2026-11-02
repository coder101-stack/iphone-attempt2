import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Flame, MessageCircle, Bookmark, Send, Music2, Play, X, Ellipsis, ZoomIn } from "lucide-react";
import { blockUser, deletePost, reportContent } from "@/lib/moderation";
import { getUser } from "@/lib/auth";
import { toast } from "sonner";
import silverSeason from "@/assets/home/silver_season.jpg";
import airForce from "@/assets/home/af1_white.jpg";
import af1Supreme from "@/assets/home/af1_supreme.jpg";
import jordan4 from "@/assets/home/jordan4.jpg";
import jordan6 from "@/assets/home/jordan6.jpg";
import jordan8 from "@/assets/home/jordan8.jpg";
import jordan9 from "@/assets/home/jordan9.jpg";
import jordan12 from "@/assets/home/jordan12.jpg";
import jordan14 from "@/assets/home/jordan14.jpg";
import jordan5 from "@/assets/home/jordan5.jpg";
import mihara from "@/assets/home/mihara.jpg";
import timberland from "@/assets/home/timberland.jpg";
import neonGreen from "@/assets/home/neon_green.jpg";
import afterDark from "@/assets/home/after_dark.jpg";
import skateStreet from "@/assets/home/skate_street.jpg";
import retroWorn from "@/assets/home/retro_worn.jpg";
import rooftop from "@/assets/home/rooftop_pinterest.jpg";
import sunglasses from "@/assets/home/sunglasses.jpg";
import nikeSlide from "@/assets/home/nike_slide.jpg";
import street_rainwalk from "@/assets/home/streetwear/arem-rainwalk.webp";
import street_stairportrait from "@/assets/home/streetwear/arem-stairportrait.webp";
import street_garagegreen from "@/assets/home/streetwear/arem-garagegreen.webp";
import street_bluedenim from "@/assets/home/streetwear/arem-bluedenim.webp";
import street_crossing from "@/assets/home/streetwear/arem-crossing.webp";
import street_redcloseup from "@/assets/home/streetwear/arem-redcloseup.webp";
import street_subwaywait from "@/assets/home/streetwear/arem-subwaywait.webp";
import street_rooftopnight from "@/assets/home/streetwear/arem-rooftopnight.webp";
import street_parkinggarage from "@/assets/home/streetwear/arem-parkinggarage.webp";
import street_cityerrands from "@/assets/home/streetwear/arem-cityerrands.webp";
import street_whitecement from "@/assets/home/streetwear/arem-whitecement.webp";
import street_subwayback from "@/assets/home/streetwear/arem-subwayback.webp";
import street_greenstance from "@/assets/home/streetwear/arem-greenstance.webp";
import street_overhead from "@/assets/home/streetwear/arem-overhead.webp";
import videoPoster from "@/assets/feed-video-1-poster.jpg";
import { AppScore } from "@/components/AppScore";
import { EmptyState, ErrorState, Skeleton } from "@/components/AppStates";
import { useDialogFocus } from "@/hooks/use-dialog-focus";
import { ScoreDetails } from "@/components/ScoreDetails";
import { HomePhotoViewer } from "@/components/HomePhotoViewer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { loadFeed, useFeedStatus, useMemberPosts, type MemberPost } from "@/lib/posts";
import { dedupeById, useDeviceSaved } from "@/lib/feed-utils";
export { dedupeById };
import { COMMENT_MAX, formatCount, shareLink, useComments, useRocked } from "@/lib/social";

type Post = {
  id: string;
  kind: "video" | "photo";
  src: string;
  tag: "Video" | "Photo" | "Outfit" | "On-feet";
  user: string;
  score: number | null;
  caption: string;
  shoe: string;
  tags: string[];
  sound?: string;
  rocks: number;
  comments: number;
  saves: string;
  city: string;
  ownerId?: string;
  mediaPath?: string;
  /** Built-in sample content (not from a real member). Labelled in the UI. */
  demo?: boolean;
  /** Home-only presentation; member uploads retain the original full-bleed layout. */
  visual?: "studio" | "portrait" | "collage" | "editorial" | "streetwear";
  gallery?: string[];
  contentType?: string;
  headline?: string;
};

/** Curated sample feed: real member posts still appear before these examples.
 * The lookbook examples are original AI editorial images (sample content),
 * NOT verified product photography. Do not use for exact shoe identification.
 * No shop prices or sold statistics.
 */
const DEMO_POSTS: Post[] = ([
  {
    id: "arem-streetwear-rainwalk", kind: "photo", src: street_rainwalk, visual: "streetwear", gallery: [street_rainwalk],
    contentType: "AREM STREETWEAR EDIT", tag: "Outfit", user: "arem.lookbook", city: "", score: null,
    caption: "Wet pavement. Oversized charcoal layers. A clean on-foot moment.", shoe: "RAIN WALK",
    tags: ["#streetwear", "#rain", "#onfeet"], rocks: 0, comments: 0, saves: "0",
  },
  {
    id: "arem-streetwear-stairportrait", kind: "photo", src: street_stairportrait, visual: "streetwear", gallery: [street_stairportrait],
    contentType: "AREM STREETWEAR EDIT", tag: "Outfit", user: "arem.lookbook", city: "", score: null,
    caption: "Denim, layered neutrals and a quiet moment on the stairs.", shoe: "CONCRETE STUDY",
    tags: ["#streetstyle", "#denim", "#stairwell"], rocks: 0, comments: 0, saves: "0",
  },
  {
    id: "arem-streetwear-garagegreen", kind: "photo", src: street_garagegreen, visual: "streetwear", gallery: [street_garagegreen],
    contentType: "AREM STREETWEAR EDIT", tag: "On-feet", user: "arem.lookbook", city: "", score: null,
    caption: "A close-up study of leather panels, lacing and green accents.", shoe: "ON FOOT / GREEN",
    tags: ["#onfeet", "#detail", "#sneakers"], rocks: 0, comments: 0, saves: "0",
  },
  {
    id: "arem-streetwear-bluedenim", kind: "photo", src: street_bluedenim, visual: "streetwear", gallery: [street_bluedenim],
    contentType: "AREM STREETWEAR EDIT", tag: "Outfit", user: "arem.lookbook", city: "", score: null,
    caption: "Blue-and-white sneakers grounded in relaxed washed denim.", shoe: "BLUE HOUR DENIM",
    tags: ["#streetstyle", "#denim", "#rotation"], rocks: 0, comments: 0, saves: "0",
  },
  {
    id: "arem-streetwear-crossing", kind: "photo", src: street_crossing, visual: "streetwear", gallery: [street_crossing],
    contentType: "AREM STREETWEAR EDIT", tag: "Outfit", user: "arem.lookbook", city: "", score: null,
    caption: "An easy stride, loose trousers and street-level footwear.", shoe: "CROSSING THE BLOCK",
    tags: ["#walking", "#streetwear", "#fitcheck"], rocks: 0, comments: 0, saves: "0",
  },
  {
    id: "arem-streetwear-redcloseup", kind: "photo", src: street_redcloseup, visual: "streetwear", gallery: [street_redcloseup],
    contentType: "AREM STREETWEAR EDIT", tag: "On-feet", user: "arem.lookbook", city: "", score: null,
    caption: "Red-and-white color blocking from the ground up.", shoe: "RETRO CLOSE-UP",
    tags: ["#closeup", "#onfeet", "#retro"], rocks: 0, comments: 0, saves: "0",
  },
  {
    id: "arem-streetwear-subwaywait", kind: "photo", src: street_subwaywait, visual: "streetwear", gallery: [street_subwaywait],
    contentType: "AREM STREETWEAR EDIT", tag: "Outfit", user: "arem.lookbook", city: "", score: null,
    caption: "Transit lighting, oversized layers and a quiet platform.", shoe: "LAST TRAIN",
    tags: ["#subway", "#night", "#streetwear"], rocks: 0, comments: 0, saves: "0",
  },
  {
    id: "arem-streetwear-rooftopnight", kind: "photo", src: street_rooftopnight, visual: "streetwear", gallery: [street_rooftopnight],
    contentType: "AREM STREETWEAR EDIT", tag: "Outfit", user: "arem.lookbook", city: "", score: null,
    caption: "Black cargo layers and yellow sneaker accents after dark.", shoe: "AFTER HOURS",
    tags: ["#night", "#rooftop", "#streetstyle"], rocks: 0, comments: 0, saves: "0",
  },
  {
    id: "arem-streetwear-parkinggarage", kind: "photo", src: street_parkinggarage, visual: "streetwear", gallery: [street_parkinggarage],
    contentType: "AREM STREETWEAR EDIT", tag: "Outfit", user: "arem.lookbook", city: "", score: null,
    caption: "Heavy concrete, oversized black layers and a candid walk.", shoe: "GARAGE LIGHT",
    tags: ["#parkinggarage", "#streetwear", "#onfeet"], rocks: 0, comments: 0, saves: "0",
  },
  {
    id: "arem-streetwear-cityerrands", kind: "photo", src: street_cityerrands, visual: "streetwear", gallery: [street_cityerrands],
    contentType: "AREM STREETWEAR EDIT", tag: "Outfit", user: "arem.lookbook", city: "", score: null,
    caption: "Relaxed charcoal styling, city motion and an unposed step.", shoe: "SIDEWALK FRAMES",
    tags: ["#sidewalk", "#fitcheck", "#city"], rocks: 0, comments: 0, saves: "0",
  },
  {
    id: "arem-streetwear-whitecement", kind: "photo", src: street_whitecement, visual: "streetwear", gallery: [street_whitecement],
    contentType: "AREM STREETWEAR EDIT", tag: "On-feet", user: "arem.lookbook", city: "", score: null,
    caption: "A tight view of textured materials and a grey-and-white sole.", shoe: "WHITE CEMENT",
    tags: ["#details", "#onfeet", "#sneakers"], rocks: 0, comments: 0, saves: "0",
  },
  {
    id: "arem-streetwear-subwayback", kind: "photo", src: street_subwayback, visual: "streetwear", gallery: [street_subwayback],
    contentType: "AREM STREETWEAR EDIT", tag: "Outfit", user: "arem.lookbook", city: "", score: null,
    caption: "Movement, reflective flooring, and red-and-white sneakers.", shoe: "PLATFORM EXIT",
    tags: ["#subway", "#streetwear", "#candid"], rocks: 0, comments: 0, saves: "0",
  },
  {
    id: "arem-streetwear-greenstance", kind: "photo", src: street_greenstance, visual: "streetwear", gallery: [street_greenstance],
    contentType: "AREM STREETWEAR EDIT", tag: "Outfit", user: "arem.lookbook", city: "", score: null,
    caption: "Everyday proportions: grey fleece, charcoal cargos, green sneakers.", shoe: "GREEN ROTATION",
    tags: ["#rotation", "#streetwear", "#green"], rocks: 0, comments: 0, saves: "0",
  },
  {
    id: "arem-streetwear-overhead", kind: "photo", src: street_overhead, visual: "streetwear", gallery: [street_overhead],
    contentType: "AREM STREETWEAR EDIT", tag: "On-feet", user: "arem.lookbook", city: "", score: null,
    caption: "One pair. The pavement. Nothing else needed.", shoe: "FROM ABOVE",
    tags: ["#overhead", "#onfeet", "#blackandwhite"], rocks: 0, comments: 0, saves: "0",
  },
  {
    id: "arem-silver", kind: "photo", src: silverSeason, visual: "portrait", gallery: [silverSeason, afterDark],
    contentType: "SNEAKER SPOTLIGHT", tag: "Photo", user: "studio.sole", city: "New York", score: 92,
    caption: "Silver season. Every panel, every lace, every detail.", shoe: "Silver Season Runner",
    tags: ["#sneakers", "#silver", "#rotation"], rocks: 32400, comments: 870, saves: "5.2K",
  },
  {
    id: "arem-creator", kind: "photo", src: rooftop, visual: "portrait", gallery: [rooftop],
    contentType: "CREATOR SPOTLIGHT", tag: "Outfit", user: "marco.fits", city: "New York", score: 88,
    caption: "The uniform: oversized black layers, city skyline, everyday sneakers.", shoe: "The Uniform",
    tags: ["#creator", "#fitcheck", "#streetwear"], rocks: 28100, comments: 610, saves: "4.6K",
  },
  {
    id: "arem-spacejam", kind: "photo", src: jordan9, visual: "studio", gallery: [jordan9],
    contentType: "SNEAKER SPOTLIGHT", tag: "Photo", user: "kickvault.nyc", city: "New York", score: 92,
    caption: "Black and white. A legendary silhouette in focus.", shoe: "Jordan 9 Retro OG Space Jam",
    tags: ["#jordan", "#sneakers", "#classic"], rocks: 52100, comments: 1440, saves: "8.1K",
  },
  {
    id: "arem-afterdark", kind: "photo", src: afterDark, visual: "portrait", gallery: [afterDark, silverSeason],
    contentType: "STREET STYLE", tag: "On-feet", user: "sail.and.suede", city: "New York", score: 87,
    caption: "After dark. Rain on the pavement, fresh greys on feet.", shoe: "After Dark",
    tags: ["#onfeet", "#streetstyle", "#night"], rocks: 19800, comments: 423, saves: "3.7K",
  },
  {
    id: "arem-editorial", kind: "photo", src: jordan4, visual: "studio", gallery: [jordan4, retroWorn],
    contentType: "EDITORIAL DROP", tag: "Photo", user: "kickvault.nyc", city: "New York", score: 92,
    caption: "Toro Bravo. One striking colorway, no distractions.", shoe: "Jordan 4 Retro Toro Bravo",
    tags: ["#editorial", "#jordan4", "#red"], rocks: 45600, comments: 1200, saves: "6.8K",
  },
  {
    id: "arem-lookbook", kind: "photo", src: silverSeason, visual: "collage", gallery: [silverSeason, rooftop, afterDark],
    contentType: "FASHION COLLAGE", tag: "Outfit", user: "stylearchive", city: "New York", score: 79,
    caption: "Silver season, the uniform, after dark. Three views of one mood.", shoe: "The Grey Edit",
    tags: ["#lookbook", "#outfit", "#silver"], rocks: 22900, comments: 640, saves: "7.4K",
  },
  {
    id: "arem-unboxing", kind: "photo", src: retroWorn, visual: "portrait", gallery: [retroWorn, jordan4],
    contentType: "UNBOXING & FIRST LOOK", tag: "Photo", user: "kickvault.nyc", city: "New York", score: 92,
    caption: "A closer look at the vintage details and that worn-in finish.", shoe: "Retro Red High",
    tags: ["#firstlook", "#retro", "#sneakers"], rocks: 38400, comments: 960, saves: "5.3K",
  },
  {
    id: "arem-neon", kind: "photo", src: neonGreen, visual: "portrait", gallery: [neonGreen],
    contentType: "BRAND EDITORIAL", tag: "Photo", user: "studio.sole", city: "Tokyo", score: 90,
    caption: "A single flash of color against total black.", shoe: "Volt on Black",
    tags: ["#editorial", "#sneakers", "#design"], rocks: 41100, comments: 1010, saves: "7.2K",
  },
  {
    id: "arem-multipanel", kind: "photo", src: airForce, visual: "collage", gallery: [airForce, skateStreet, sunglasses],
    contentType: "MULTI-PANEL FIT", tag: "Outfit", user: "stylearchive", city: "New York", score: 80,
    caption: "Clean white kicks, skate culture, and the finishing details.", shoe: "The Essentials",
    tags: ["#styling", "#skate", "#rotation"], rocks: 24300, comments: 611, saves: "6.1K",
  },
  {
    id: "arem-culture", kind: "photo", src: skateStreet, visual: "portrait", gallery: [skateStreet, mihara],
    contentType: "SNEAKER & STREETWEAR CULTURE", tag: "On-feet", user: "dante", city: "New York", score: 87,
    caption: "One board, one pair, and a whole city to explore.", shoe: "Skate Street",
    tags: ["#culture", "#skate", "#streetwear"], rocks: 33400, comments: 800, saves: "4.8K",
  },
  {
    id: "arem-jordan6", kind: "photo", src: jordan6, visual: "studio", gallery: [jordan6],
    contentType: "SNEAKER SPOTLIGHT", tag: "Photo", user: "kickvault.nyc", city: "New York", score: 92,
    caption: "White leather and infrared details.", shoe: "Jordan 6 Retro Infrared White",
    tags: ["#jordan6", "#retro", "#details"], rocks: 30200, comments: 512, saves: "3.2K",
  },
  {
    id: "arem-jordan12", kind: "photo", src: jordan12, visual: "studio", gallery: [jordan12],
    contentType: "SNEAKER SPOTLIGHT", tag: "Photo", user: "kickvault.nyc", city: "New York", score: 92,
    caption: "Cream and chocolate tones, all in the details.", shoe: "Jordan 12 Retro Fireside",
    tags: ["#jordan12", "#colorway", "#rotation"], rocks: 19200, comments: 320, saves: "2.1K",
  },
  {
    id: "arem-mihara", kind: "photo", src: mihara, visual: "studio", gallery: [mihara],
    contentType: "LOOKBOOK GRID", tag: "Photo", user: "stylearchive", city: "New York", score: 79,
    caption: "Unmistakable shape, worn your way.", shoe: "Mihara Hank OG Sole",
    tags: ["#lookbook", "#canvas", "#streetwear"], rocks: 25100, comments: 420, saves: "3.2K",
  },
  {
    id: "arem-jordan8", kind: "photo", src: jordan8, visual: "studio", gallery: [jordan8],
    contentType: "SNEAKER SPOTLIGHT", tag: "Photo", user: "kickvault.nyc", city: "New York", score: 92,
    caption: "Black-on-black with a chrome finish.", shoe: "Jordan 8 Retro Chrome",
    tags: ["#jordan8", "#chrome", "#sneakers"], rocks: 28900, comments: 490, saves: "3.5K",
  },
  {
    id: "arem-jordan14", kind: "photo", src: jordan14, visual: "studio", gallery: [jordan14],
    contentType: "SNEAKER SPOTLIGHT", tag: "Photo", user: "kickvault.nyc", city: "New York", score: 92,
    caption: "Forest green accents and sculpted lines.", shoe: "Jordan 14 White Forest Green",
    tags: ["#jordan14", "#forestgreen", "#sneakers"], rocks: 17400, comments: 390, saves: "2.8K",
  },
  {
    id: "arem-timberland", kind: "photo", src: timberland, visual: "studio", gallery: [timberland],
    contentType: "STREET STYLE", tag: "Photo", user: "stylearchive", city: "New York", score: 79,
    caption: "A streetwear classic for every season.", shoe: "Wheat 6-Inch Boot",
    tags: ["#timberland", "#streetwear", "#boots"], rocks: 16600, comments: 350, saves: "2.3K",
  },
  {
    id: "arem-af1", kind: "photo", src: af1Supreme, visual: "studio", gallery: [af1Supreme, airForce],
    contentType: "SNEAKER SPOTLIGHT", tag: "Photo", user: "kickvault.nyc", city: "New York", score: 92,
    caption: "The all-white essential, styled a thousand different ways.", shoe: "Air Force 1 Supreme White",
    tags: ["#airforce1", "#clean", "#essentials"], rocks: 46400, comments: 980, saves: "7.8K",
  },
  {
    id: "arem-jordan5", kind: "photo", src: jordan5, visual: "studio", gallery: [jordan5],
    contentType: "SNEAKER SPOTLIGHT", tag: "Photo", user: "kickvault.nyc", city: "New York", score: 92,
    caption: "A midnight palette with bold finishing details.", shoe: "Jordan 5 Retro Halloween",
    tags: ["#jordan5", "#night", "#retro"], rocks: 19200, comments: 395, saves: "2.6K",
  },
  {
    id: "arem-slide", kind: "photo", src: nikeSlide, visual: "studio", gallery: [nikeSlide],
    contentType: "BRAND EDITORIAL", tag: "Photo", user: "studio.sole", city: "New York", score: 90,
    caption: "Even the simplest silhouettes deserve a closer look.", shoe: "Black Chrome Slide",
    tags: ["#editorial", "#design", "#minimal"], rocks: 15100, comments: 210, saves: "1.8K",
  },
  {
    // Original Lovable-only video URL returned HTTP 404 when run outside Lovable.
    // Use the included still for this sample; real member videos still play from Supabase Storage.
    id: "p1", kind: "photo", src: videoPoster, visual: "portrait", gallery: [videoPoster],
    tag: "Photo", user: "kickvault.nyc", city: "New York", score: 92,
    caption: "A close look at the leather, shape, and details.", shoe: "Varsity Red High '85",
    contentType: "SNEAKER SPOTLIGHT", tags: ["#retro", "#basketball", "#hype"],
    rocks: 48200, comments: 1204, saves: "6.1K",
  },
] as Post[]).map((p) => ({ ...p, demo: true }));

function FeedVideo({ src, active, poster, onDoubleTap }: { src: string; active: boolean; poster?: string | undefined; onDoubleTap?: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (tapTimer.current) clearTimeout(tapTimer.current); }, []);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    // React does not reliably render the `muted` attribute; iOS Safari blocks
    // autoplay (and shows a black frame) unless the element is truly muted.
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");
    if (active) {
      setPaused(false);
      v.play().catch(() => setPaused(true));
    } else {
      v.pause();
    }
  }, [active]);
  const togglePlay = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      v.muted = true;
      v.play().then(() => setPaused(false)).catch(() => setPaused(true));
    } else {
      v.pause();
      setPaused(true);
    }
  };
  return (
    <button
      type="button"
      aria-label={paused ? "Play video. Double tap to Rock It" : "Pause video. Double tap to Rock It"}
      className="absolute inset-0 h-full w-full bg-background"
      onClick={() => {
        // Double tap = Rock It (same as photos); single tap = play/pause.
        if (tapTimer.current) { clearTimeout(tapTimer.current); tapTimer.current = null; onDoubleTap?.(); return; }
        tapTimer.current = setTimeout(() => { tapTimer.current = null; togglePlay(); }, 250);
      }}
    >
      <video
        ref={ref}
        src={`${src}#t=0.001`}
        poster={poster}
        className="h-full w-full object-cover"
        loop
        muted
        autoPlay={active}
        playsInline
        preload="auto"
      />

      {paused && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Play className="h-16 w-16 fill-foreground/80 text-foreground/80" />
        </span>
      )}
    </button>
  );
}

function Action({
  icon: Icon,
  label,
  ariaLabel,
  active,
  onClick,
  children,
}: {
  icon: typeof Flame;
  label: string;
  ariaLabel: string;
  active?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      className="relative flex min-h-12 min-w-12 flex-col items-center justify-center gap-1 text-white"
    >
      <Icon
        className={`h-7 w-7 drop-shadow-lg transition-transform active:scale-90 ${active ? "fill-foreground" : ""}`}
        strokeWidth={1.8}
      />
      <span className="text-[11px] font-semibold drop-shadow">{label}</span>
      {children}
    </button>
  );
}

const DEMO_COMMENTS: Record<string, { user: string; text: string }[]> = {
  p1: [{ user: "dante", text: "That tumble on the leather is unreal." }, { user: "studio.sole", text: "Need the side profile next." }],
  p2: [{ user: "sail.and.suede", text: "Suede in the rain is brave. Respect." }],
  p3: [{ user: "kickvault.nyc", text: "Whites doing all the talking." }, { user: "dante", text: "Fit is clean." }],
  p4: [],
  p5: [{ user: "marco.fits", text: "Single light? Insane." }],
};

function CommentsPanel({ post, onClose }: { post: Post; onClose: () => void }) {
  const dialogRef = useDialogFocus<HTMLDivElement>();
  const [mine, add] = useComments(post.id);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const list = [...(DEMO_COMMENTS[post.id] ?? []).map((c, i) => ({ ...c, id: `d${i}` })), ...mine];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return setError("Write something first.");
    if (!(await add(text))) return;
    setText("");
    setError("");
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 animate-in fade-in duration-150 sm:items-center" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Comments"
        onClick={(e) => e.stopPropagation()}
        className="safe-bottom flex max-h-[75dvh] w-full flex-col rounded-t-xl border-t border-border bg-background font-display text-foreground shadow-card outline-none animate-in slide-in-from-bottom-4 duration-200 sm:max-w-md sm:rounded-xl sm:border"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <p className="text-heading">{formatCount(post.comments + mine.length)} Comments</p>
          <Button type="button" variant="ghost" size="icon" aria-label="Close comments" onClick={onClose} className="h-11 w-11">
            <X />
          </Button>
        </div>
        <ul className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4">
          {list.length === 0 && <li className="py-8 text-center"><p className="text-heading">No comments yet</p><p className="mt-1 text-caption">Be the first to say something.</p></li>}
          {list.map((c) => (
            <li key={c.id} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold uppercase">{c.user[0]}</span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold">@{c.user}</p>
                <p className="whitespace-pre-wrap break-words text-[15px] leading-[1.4]">{c.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <form onSubmit={submit} className="border-t border-border p-3">
          <div className="flex items-end gap-2">
            <Textarea
              value={text}
              onChange={(e) => { setText(e.target.value); setError(""); }}
              maxLength={COMMENT_MAX}
              rows={1}
              placeholder="Add a comment…"
              aria-label="Write a comment"
              className="min-h-11 flex-1 resize-none rounded-sm text-base"
            />
            <Button type="submit" disabled={!text.trim()} className="h-11 rounded-full px-5 text-[15px] font-semibold">Post</Button>
          </div>
          <div className="mt-1 flex justify-between text-[13px] text-muted-foreground">
            <span role="alert" className="text-destructive">{error}</span>
            <span>{text.length}/{COMMENT_MAX}</span>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function PostSlide({ post, active }: { post: Post; active: boolean }) {
  const [rocked, toggleRock] = useRocked(`post:${post.id}`);
  const [mine] = useComments(post.id);
  const [saved, toggleSaved] = useDeviceSaved(post.id);
  const [showScore, setShowScore] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [followingCreator, setFollowingCreator] = useState(false);
  const photoTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (photoTapTimer.current) clearTimeout(photoTapTimer.current); }, []);
  const [bump, setBump] = useState<{ key: number; text: string } | null>(null);

  const rock = (force?: boolean) => {
    if (force && rocked) return;
    setBump({ key: Date.now(), text: rocked ? "−1" : "+1" });
    toggleRock();
  };
  useEffect(() => {
    if (!bump) return;
    const t = setTimeout(() => setBump(null), 700);
    return () => clearTimeout(t);
  }, [bump]);

  const photoTap = () => {
    if (photoTapTimer.current) {
      clearTimeout(photoTapTimer.current);
      photoTapTimer.current = null;
      rock(true); // Double tap to Rock It, like the original AREM Home feed.
      return;
    }
    photoTapTimer.current = setTimeout(() => {
      photoTapTimer.current = null;
      setShowPhotos(true); // Single tap to zoom.
    }, 240);
  };

  const share = () => shareLink(`@${post.user} — ${post.shoe}`, `${window.location.origin}/?post=${post.id}`);

  return (
    <article data-post-id={post.id} className="relative h-full w-full snap-start snap-always overflow-hidden bg-background">
      {post.kind === "video" ? (
        <FeedVideo src={post.src} active={active} poster={post.id === "p1" ? videoPoster : undefined} onDoubleTap={() => rock(true)} />
      ) : post.visual === "collage" && post.gallery?.length ? (
        <button type="button" onClick={photoTap} aria-label={`Explore photos: ${post.shoe}. Double tap to Rock It`} className="absolute inset-0 grid w-full grid-cols-2 grid-rows-[60%_40%] gap-[3px] bg-black text-left">
          {post.gallery.slice(0, 3).map((src, index) => (
            <div key={src} className={`relative min-h-0 overflow-hidden ${index === 0 ? "col-span-2" : ""} ${src === airForce ? "bg-white" : "bg-[#171717]"}`}>
              <img src={src} alt={`${post.shoe}: photo ${index + 1}`} className="h-full w-full object-contain" loading="lazy" decoding="async" />
            </div>
          ))}
        </button>
      ) : (
        <button type="button" aria-label={`Zoom photos: ${post.shoe}. Double tap to Rock It`} onClick={photoTap} className={`absolute inset-0 flex w-full items-center justify-center overflow-hidden ${post.visual === "studio" ? "bg-[#f7f7f7]" : "bg-black"}`}>
          {/* A soft backdrop fills wide/tall screens without cropping any sneakers. */}
          {post.visual !== "studio" && (
            <img
              src={post.src}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-3xl"
            />
          )}
          <img
            src={post.src}
            alt={`${post.shoe} — ${post.tag}`}
            loading={active ? "eager" : "lazy"}
            decoding="async"
            className="relative z-10 h-full w-full object-contain"
          />
        </button>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/85 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[22rem] bg-gradient-to-t from-black/95 via-black/65 to-transparent" />

      <div className="absolute bottom-6 right-3 flex flex-col items-center gap-2 text-white">
        <button type="button" aria-label={`View @${post.user} profile`} onClick={() => setShowCreator(true)} className="mb-1 flex h-11 w-11 items-center justify-center rounded-full border-2 border-foreground bg-secondary text-sm font-bold uppercase">
          {post.user[0]}
        </button>
        <Action icon={Flame} ariaLabel={rocked ? "Remove Rock It" : "Rock It"} label={formatCount(post.rocks + (rocked ? 1 : 0))} active={rocked} onClick={() => rock()}>
          {bump && (
            <span key={bump.key} className="pointer-events-none absolute -top-3 text-xs font-bold animate-out fade-out slide-out-to-top-4 duration-700 fill-mode-forwards">
              {bump.text}
            </span>
          )}
        </Action>
        <Action icon={MessageCircle} ariaLabel="Comments" label={formatCount(post.comments + mine.length)} onClick={() => setShowComments(true)} />
        <Action icon={Bookmark} ariaLabel={saved ? "Unsave" : "Save"} label={post.saves} active={saved} onClick={toggleSaved} />
        <Action icon={Send} ariaLabel="Share" label="Share" onClick={share} />
        {post.kind === "photo" && <Action icon={ZoomIn} ariaLabel="Zoom and explore photos" label="Zoom" onClick={() => setShowPhotos(true)} />}
        <Action icon={Ellipsis} ariaLabel="More options" label="More" onClick={() => setShowMore(true)} />
      </div>

      <div className="absolute bottom-6 left-4 right-20 space-y-2 text-white">
        {post.contentType && <p className="mb-3 inline-flex border-b border-white/80 pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">{post.contentType}</p>}
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-display">
            <span className="text-[15px] font-semibold drop-shadow">@{post.user}</span>
            <button type="button" onClick={() => setShowScore(true)} aria-label={`View AREM Score details for @${post.user}`} className="relative inline-flex min-h-11 items-center rounded-full transition-transform active:scale-95 motion-reduce:transition-none">
              <AppScore variant="feed" tone="dark" score={post.score} />
            </button>
            {post.demo && <span className="rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/85 ring-1 ring-white/15">Demo</span>}
          </div>
        </div>
        <p className="font-display text-xs font-medium uppercase tracking-[0.2em] text-foreground/70">
          {post.shoe}
        </p>
        <p className="text-[15px] leading-[1.4] text-foreground/90">"{post.caption}"</p>
        <div className="flex flex-wrap gap-x-2.5 gap-y-1">
          {post.tags.map((t) => (
            <span key={t} className="text-xs font-medium text-foreground/70">{t}</span>
          ))}
        </div>
        {post.kind === "photo" && post.gallery && post.gallery.length > 1 && (
          <button type="button" onClick={() => setShowPhotos(true)} className="mt-2 border border-white/70 bg-black/40 px-4 py-2.5 text-xs font-bold uppercase tracking-[.12em] text-white">View photos ({post.gallery.length})</button>
        )}
        {post.sound && (
          <p className="flex items-center gap-1.5 text-xs text-foreground/80">
            <Music2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{post.sound}</span>
          </p>
        )}
      </div>
      {showPhotos && <HomePhotoViewer images={post.gallery?.length ? post.gallery : [post.src]} title={post.shoe} onClose={() => setShowPhotos(false)} />}
      {showCreator && createPortal(
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70" onClick={() => setShowCreator(false)}>
          <section role="dialog" aria-modal="true" aria-label={`Creator @${post.user}`} onClick={(e) => e.stopPropagation()} className="safe-bottom w-full max-w-md border-t border-white/25 bg-[#111] px-5 py-6 text-center text-white">
            <button type="button" onClick={() => setShowCreator(false)} className="float-right flex h-11 w-11 items-center justify-center" aria-label="Close creator profile"><X /></button>
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-white text-2xl font-bold uppercase">{post.user[0]}</div>
            <h2 className="text-lg font-bold">@{post.user}</h2>
            <p className="mt-1 text-sm text-white/70">Sneakers · Streetwear · Community</p>
            <button type="button" onClick={() => setFollowingCreator((v) => !v)} className="mt-5 min-h-11 w-full bg-white px-4 font-semibold text-black">{followingCreator ? "Following · Demo" : "Follow · Demo"}</button>
            <p className="mt-3 text-xs text-white/60">Sample profile preview; following isn't saved to an account.</p>
          </section>
        </div>, document.body
      )}
      {showScore && <ScoreDetails username={post.user} score={post.score} onClose={() => setShowScore(false)} />}
      {showMore && <PostOptions post={post} onClose={() => setShowMore(false)} />}
      {showComments && <CommentsPanel post={post} onClose={() => setShowComments(false)} />}
    </article>
  );
}

type FeedTab = "community" | "local" | "following" | "foryou";

const FEED_TABS: { id: FeedTab; label: string }[] = [
  { id: "community", label: "Community" },
  { id: "local", label: "Local" },
  { id: "following", label: "Following" },
  { id: "foryou", label: "For You" },
];

/** Demo viewer context until accounts exist. */
const DEMO_CITY = "New York";
const DEMO_FOLLOWING = ["marco.fits", "studio.sole"];

const EMPTY_TEXT: Record<FeedTab, string> = {
  community: "Nothing gaining attention right now.",
  local: `No posts from ${DEMO_CITY} yet.`,
  following: "Follow people to see their posts here.",
  foryou: "Nothing to show yet.",
};

const TAG_FOR: Record<string, Post["tag"]> = { VIDEO: "Video", "ON FEET": "On-feet", FIT: "Outfit" };
function fromMember(m: MemberPost): Post {
  return {
    id: m.id, kind: m.video ? "video" : "photo", src: m.url, tag: TAG_FOR[m.kind] ?? "Photo", user: m.username, score: m.score,
    caption: m.caption, shoe: m.sneaker, tags: m.tags.map((t) => `#${t.toLowerCase()}`), rocks: 0, comments: 0, saves: "0", city: "", ownerId: m.userId, mediaPath: m.mediaPath,
  };
}

function postsFor(tab: FeedTab, member: Post[]): Post[] {
  const POSTS = dedupeById([...member, ...DEMO_POSTS]);
  switch (tab) {
    case "community":
      // Fresh member posts first, then popular posts — deduplicated so nothing appears twice.
      return dedupeById([...member, ...POSTS.filter((p) => p.rocks >= 20000).sort((a, b) => b.rocks - a.rocks)]);
    case "local":
      return POSTS.filter((p) => p.city === DEMO_CITY);
    case "following":
      return POSTS.filter((p) => DEMO_FOLLOWING.includes(p.user));
    default:
      return POSTS;
  }
}

/** Full-screen vertical, snap-scrolling sneaker feed. */
export function HomeFeed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [feedTab, setFeedTab] = useState<FeedTab>("foryou");
  const member = useMemberPosts();
  const status = useFeedStatus();
  const posts = postsFor(feedTab, member.map(fromMember));
  const memberCount = member.length;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => setActiveIndex(Math.round(el.scrollTop / el.clientHeight));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // TikTok-like keyboard and mouse navigation; native CSS scroll snapping handles touch swipes.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let lastWheel = 0;
    const jump = (delta: number) => {
      const current = Math.round(container.scrollTop / Math.max(1, container.clientHeight));
      const next = Math.max(0, Math.min(posts.length - 1, current + delta));
      container.scrollTo({ top: next * container.clientHeight, behavior: "smooth" });
    };
    const wheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 8 || event.ctrlKey) return;
      event.preventDefault();
      const now = Date.now();
      if (now - lastWheel < 550) return;
      lastWheel = now;
      jump(event.deltaY > 0 ? 1 : -1);
    };
    const key = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input,textarea,select,[contenteditable=true],[role=dialog]")) return;
      if (document.querySelector('[role="dialog"]')) return;
      if (event.key === "ArrowDown" || event.key === "PageDown") { event.preventDefault(); jump(1); }
      if (event.key === "ArrowUp" || event.key === "PageUp") { event.preventDefault(); jump(-1); }
    };
    container.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", key);
    return () => { container.removeEventListener("wheel", wheel); window.removeEventListener("keydown", key); };
  }, [posts.length]);

  // Shared links (/?post=<id>) open on that post.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("post");
    const index = posts.findIndex((p) => p.id === id);
    const el = containerRef.current;
    if (index < 0 || !el) return;
    requestAnimationFrame(() => {
      el.scrollTop = index * el.clientHeight;
      setActiveIndex(index);
    });
  }, [member.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectTab = (tab: FeedTab) => {
    // Tapping the active tab again refreshes the feed (no pull-to-refresh on a snap scroller).
    if (tab === feedTab) void loadFeed();
    setFeedTab(tab);
    setActiveIndex(0);
    if (containerRef.current) containerRef.current.scrollTop = 0;
  };

  return (
    <div className="relative h-full w-full">
      <nav className="pointer-events-none absolute inset-x-0 top-14 z-30 flex items-center justify-center gap-1 px-2 text-white">
        {FEED_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={feedTab === t.id}
            aria-label={feedTab === t.id ? `${t.label} (tap to refresh)` : t.label}
            onClick={() => selectTab(t.id)}
            className={`pointer-events-auto relative h-11 px-2 font-display text-[13px] font-semibold uppercase tracking-wide drop-shadow-lg transition-colors ${
              feedTab === t.id ? "text-white" : "text-white/65"
            }`}
          >
            {t.label}
            <span
              className={`absolute bottom-1.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-white transition-opacity ${
                feedTab === t.id ? "opacity-100" : "opacity-0"
              }`}
            />
          </button>
        ))}
      </nav>

      <div
        ref={containerRef}
        className="h-full w-full snap-y snap-mandatory overflow-y-scroll overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {posts.length === 0 && status === "loading" ? (
          <div role="status" aria-label="Loading feed" className="relative h-full w-full bg-background">
            <Skeleton className="absolute inset-0 rounded-none opacity-60" />
            <div className="absolute bottom-6 left-4 right-20 space-y-2.5">
              <Skeleton className="h-5 w-40 bg-white/15" />
              <Skeleton className="h-3 w-28 bg-white/15" />
              <Skeleton className="h-4 w-56 bg-white/15" />
            </div>
          </div>
        ) : posts.length === 0 && status === "error" ? (
          <div className="flex h-full items-center justify-center"><ErrorState message="We couldn't load the feed. Check your connection." onRetry={() => void loadFeed()} /></div>
        ) : posts.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState title="Nothing here yet" message={EMPTY_TEXT[feedTab]} action="Show For You" onAction={() => selectTab("foryou")} />
          </div>
        ) : (
          posts.map((post, i) => <PostSlide key={post.id} post={post} active={i === activeIndex} />)
        )}
      </div>
      {status === "error" && posts.length > 0 && (
        <div role="alert" className="absolute inset-x-0 top-28 z-30 flex justify-center px-4">
          <button type="button" onClick={() => void loadFeed()} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-black/70 px-4 text-[13px] font-medium text-white ring-1 ring-white/15 backdrop-blur-sm">
            Couldn't load new posts · Retry
          </button>
        </div>
      )}
      {status === "loading" && memberCount > 0 && <span className="sr-only" role="status">Refreshing feed</span>}
    </div>
  );
}

function PostOptions({ post, onClose }: { post: Post; onClose: () => void }) {
  const mine = !!post.ownerId && post.ownerId === getUser()?.id;
  const [confirm, setConfirm] = useState(false);
  const dialogRef = useDialogFocus<HTMLDivElement>(onClose);
  const run = async (p: Promise<{ error?: string }>, ok: string) => {
    const r = await p;
    if (r.error) toast.error(r.error); else { toast.success(ok); onClose(); }
  };
  return createPortal(
    <div className="fixed inset-0 z-[65] flex items-end justify-center bg-black/40" onClick={onClose}>
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Post options" className="safe-bottom w-full max-w-lg rounded-t-xl border-t border-border bg-background p-3 font-display text-foreground shadow-card outline-none animate-in slide-in-from-bottom-4 duration-200" onClick={(e) => e.stopPropagation()}>
        {post.demo && <p className="px-3 pb-2 pt-1 text-caption">This is sample content included with AREM.</p>}
        {mine ? (
          confirm ? (
            <Button type="button" variant="destructive" className="h-12 w-full rounded-lg text-[15px] font-semibold" onClick={() => run(deletePost(post.id, post.mediaPath!), "Post deleted")}>Yes, delete this post</Button>
          ) : (
            <Button type="button" variant="ghost" className="h-12 w-full rounded-lg text-[15px] font-semibold text-destructive" onClick={() => setConfirm(true)}>Delete post</Button>
          )
        ) : (
          <>
            {!post.demo && <Button type="button" variant="ghost" className="h-12 w-full rounded-lg text-[15px] font-semibold" onClick={() => run(reportContent("post", post.id, "Inappropriate post"), "Report sent. Thanks.")}>Report post</Button>}
            {post.ownerId && (
              <Button type="button" variant="ghost" className="h-12 w-full rounded-lg text-[15px] font-semibold text-destructive" onClick={() => run(blockUser(post.ownerId!), `@${post.user} blocked`)}>Block @{post.user}</Button>
            )}
          </>
        )}
        <Button type="button" variant="outline" className="mt-2 h-12 w-full rounded-lg text-[15px] font-semibold shadow-none" onClick={onClose}>Cancel</Button>
      </div>
    </div>,
    document.body,
  );
}
