import { NavLink } from 'react-router-dom';

const tracks = [
  'HTML & CSS',
  'JavaScript',
  'React',
  'Node.js',
  'Express.js',
  'MongoDB',
  'Git & GitHub',
];

const bootcampStats = [
  ['7', 'core technologies'],
  ['8', 'expert mentors'],
  ['3', 'active batches'],
  ['100%', 'project based'],
];

const questions = [
  ['Who can join?', 'ASTU students interested in practical software development.'],
  ['How does learning work?', 'Weekly sessions, mentor support, and hands-on projects.'],
  ['How do I apply?', 'Create an account and complete the registration form.'],
];

function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
      <b className="text-xl text-ink">
        ASTU <span className="text-brand">MSJ</span>
      </b>

      <div className="flex gap-3">
        <NavLink to="/login" className="btn-secondary">
          Log in
        </NavLink>
        <NavLink to="/register" className="btn-primary">
          Join bootcamp
        </NavLink>
      </div>
    </header>
  );
}

function HeroStats() {
  return (
    <div className="rounded-3xl bg-ink p-8 text-white shadow-soft">
      <p className="text-sand/80">This summer at a glance</p>

      <div className="mt-8 grid grid-cols-2 gap-5">
        {bootcampStats.map(([value, label]) => (
          <div key={value} className="rounded-2xl bg-white/10 p-5">
            <b className="text-3xl">{value}</b>
            <p className="mt-1 text-sm text-slate-300">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2 md:items-center">
      <div>
        <p className="mb-4 font-semibold text-brand">SUMMER BOOTCAMP 2026</p>
        <h1 className="text-4xl font-extrabold leading-tight text-ink sm:text-6xl">
          Build skills that launch careers.
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          A practical learning community for ASTU students-guided by mentors, projects, and real
          feedback.
        </p>

        <div className="mt-8 flex gap-3">
          <NavLink to="/register" className="btn-primary">
            Apply now
          </NavLink>
          <a href="#tracks" className="btn-secondary">
            Explore tracks
          </a>
        </div>
      </div>

      <HeroStats />
    </section>
  );
}

function TracksSection() {
  return (
    <section id="tracks" className="bg-mist px-5 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-ink">Your learning path</h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tracks.map((track, index) => (
            <div className="card p-5" key={track}>
              <span className="text-sm font-bold text-brand">0{index + 1}</span>
              <h3 className="mt-5 font-bold">{track}</h3>
              <p className="mt-1 text-sm text-slate-500">Learn by building.</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuestionsSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <h2 className="text-3xl font-bold text-ink">Questions, answered</h2>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {questions.map(([title, body]) => (
          <div className="card p-5" key={title}>
            <h3 className="font-bold">{title}</h3>
            <p className="mt-2 text-sm text-slate-600">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-white">
      <SiteHeader />
      <HeroSection />
      <TracksSection />
      <QuestionsSection />

      <footer className="bg-ink px-5 py-10 text-center text-sm text-slate-400">
        ASTU MSJ Summer Bootcamp - Adama Science and Technology University
      </footer>
    </div>
  );
}
