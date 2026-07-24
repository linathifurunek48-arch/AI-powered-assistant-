import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, UtensilsCrossed, Flame, Leaf, Heart } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ixhosa Flavours — Authentic Xhosa Recipes" },
      {
        name: "description",
        content:
          "Traditional Xhosa and South African recipes: Umngqusho, Potjiekos, Pap & Chakalaka and more.",
      },
      { property: "og:title", content: "Ixhosa Flavours — Authentic Xhosa Recipes" },
      {
        property: "og:description",
        content: "Discover traditional Xhosa dishes made with love and heritage.",
      },
      {
        property: "og:image",
        content:
          "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=80",
      },
      {
        name: "twitter:image",
        content:
          "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=80",
      },
    ],
  }),
  component: IxhosaFlavours,
});

const recipes = [
  {
    name: "Umngqusho",
    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
    desc: "A traditional Xhosa meal of samp and sugar beans, often served with slow-braised meat.",
    tag: "Heritage",
  },
  {
    name: "Potjiekos",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
    desc: "Slow-cooked meat and vegetables prepared in a cast-iron pot over an open fire.",
    tag: "Slow-cooked",
  },
  {
    name: "Pap & Chakalaka",
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
    desc: "Soft maize meal served with a bright, spicy vegetable relish loved across South Africa.",
    tag: "Everyday",
  },
  {
    name: "Amagwinya",
    img: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=900&q=80",
    desc: "Golden fried dough — the beloved South African vetkoek, perfect with mince or jam.",
    tag: "Street food",
  },
  {
    name: "Inyama Yenkomo",
    img: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=900&q=80",
    desc: "Flame-grilled beef seasoned simply, celebrating the pure taste of the meat.",
    tag: "Braai",
  },
  {
    name: "Umleqwa",
    img: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=900&q=80",
    desc: "Free-range hard-body chicken stewed with onions, tomatoes and aromatic spices.",
    tag: "Comfort",
  },
];

function IxhosaFlavours() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'Poppins', ui-sans-serif, system-ui, sans-serif" }}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-primary text-primary-foreground shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12">
          <a href="#top" className="flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6" />
            <span
              className="text-2xl font-bold tracking-wide"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Ixhosa Flavours
            </span>
          </a>
          <nav className="hidden gap-8 text-sm font-medium md:flex">
            <a href="#top" className="hover:text-accent transition-colors">Home</a>
            <a href="#recipes" className="hover:text-accent transition-colors">Recipes</a>
            <a href="#about" className="hover:text-accent transition-colors">About</a>
            <a href="#contact" className="hover:text-accent transition-colors">Contact</a>
          </nav>
          <button
            aria-label="Toggle menu"
            className="rounded-md p-2 hover:bg-primary-foreground/10 md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <nav className="flex flex-col gap-3 border-t border-primary-foreground/20 px-6 py-4 text-sm md:hidden">
            <a href="#top" onClick={() => setOpen(false)}>Home</a>
            <a href="#recipes" onClick={() => setOpen(false)}>Recipes</a>
            <a href="#about" onClick={() => setOpen(false)}>About</a>
            <a href="#contact" onClick={() => setOpen(false)}>Contact</a>
          </nav>
        )}
      </header>

      {/* Hero */}
      <section
        id="top"
        className="relative flex min-h-[80vh] items-center justify-center px-6 text-center text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(77,52,46,.65), rgba(77,52,46,.75)), url('https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs uppercase tracking-[0.2em] backdrop-blur">
            <Flame className="h-3.5 w-3.5" /> Rooted in Heritage
          </span>
          <h1
            className="mt-6 text-5xl font-bold leading-tight md:text-6xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Authentic Xhosa Recipes
          </h1>
          <p className="mt-5 text-lg text-white/90 md:text-xl">
            Discover traditional African Xhosa dishes made with love, fire, and generations of story.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#recipes"
              className="rounded-full bg-accent px-7 py-3 text-sm font-semibold text-accent-foreground shadow-lg transition hover:brightness-110"
            >
              Explore Recipes
            </a>
            <a
              href="#about"
              className="rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Our Story
            </a>
          </div>
        </div>
      </section>

      {/* Recipes */}
      <section id="recipes" className="mx-auto max-w-7xl px-6 py-20 md:px-12">
        <div className="mb-12 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-brand">Signature dishes</p>
          <h2
            className="mt-3 text-4xl font-bold md:text-5xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Popular Recipes
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            A taste of the Eastern Cape — each recipe carries the aroma of home, hearth, and heritage.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((r) => (
            <article
              key={r.name}
              className="group overflow-hidden rounded-2xl bg-card shadow-md ring-1 ring-border transition duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={r.img}
                  alt={r.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground">
                  {r.tag}
                </span>
              </div>
              <div className="p-6">
                <h3
                  className="text-2xl font-semibold"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {r.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-surface-muted px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
          {[
            {
              icon: Heart,
              title: "Made with Love",
              text: "Every recipe is a love letter to the elders who taught us to cook by feel, taste and memory.",
            },
            {
              icon: Leaf,
              title: "Rooted Ingredients",
              text: "Samp, maize, sugar beans and wild greens — humble ingredients that carry deep cultural meaning.",
            },
            {
              icon: Flame,
              title: "Fire & Tradition",
              text: "From three-legged pots to open flames, we honour the techniques that shape true Xhosa flavour.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl bg-card p-8 shadow-sm ring-1 ring-border"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <Icon className="h-6 w-6" />
              </div>
              <h3
                className="mt-5 text-xl font-semibold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-3xl text-center">
          <h2
            className="text-3xl font-bold md:text-4xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Our Mission
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We celebrate the rich culinary traditions of the Xhosa people by sharing authentic
            recipes, cooking tips, and cultural stories that bring families together around
            delicious homemade meals.
          </p>
        </div>
      </section>

      {/* Contact / Footer */}
      <footer id="contact" className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 md:grid-cols-3 md:px-12">
          <div>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5" />
              <span
                className="text-xl font-bold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Ixhosa Flavours
              </span>
            </div>
            <p className="mt-3 text-sm text-primary-foreground/80">
              Authentic African Xhosa food recipes, told with heart.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm text-primary-foreground/80">
              <li><a href="#recipes" className="hover:text-accent">Recipes</a></li>
              <li><a href="#about" className="hover:text-accent">About</a></li>
              <li><a href="#contact" className="hover:text-accent">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest">Get in touch</h4>
            <p className="mt-3 text-sm text-primary-foreground/80">
              linathifurunek48@gmail.com
              <br />
              Cape Town, Philippi
            </p>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 py-5 text-center text-xs text-primary-foreground/70">
          © 2026 Ixhosa Flavours · African Xhosa Food Recipes
        </div>
      </footer>
    </div>
  );
}
