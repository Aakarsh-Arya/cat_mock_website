export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
              CAT
            </div>
            <span className="text-base font-semibold tracking-tight">CAT Mock Arena</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/auth/sign-in"
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              Sign in
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto w-full max-w-6xl px-4 pb-12 pt-16 sm:px-6 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Built for serious CAT prep
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                CAT-style mocks. Timed. Section-wise.
              </h1>
              <p className="mt-5 text-lg text-slate-600">
                Experience authentic CAT mock tests with locked sections, real-time timers, and detailed
                performance analytics. Practice in a calm, focused interface built for exam day.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="/auth/sign-in"
                  className="inline-flex items-center justify-center rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                >
                  Sign in
                </a>
                <a
                  href="/mocks"
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                >
                  Start a mock
                </a>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-slate-500">
                <span>✔️ Section-locked flow</span>
                <span>✔️ CAT-style palette</span>
                <span>✔️ Performance insights</span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">Mock Preview</span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  Live
                </span>
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-xs uppercase text-slate-500">Current Section</div>
                  <div className="text-lg font-semibold text-slate-900">VARC</div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {['Answered', 'Not Answered', 'Marked'].map((label) => (
                    <div
                      key={label}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-3 text-xs font-semibold text-slate-600"
                    >
                      {label}
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-slate-200 bg-white px-4 py-4">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Time left</span>
                    <span className="font-semibold text-slate-900">34:12</span>
                  </div>
                  <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                    <div className="h-2 w-2/3 rounded-full bg-slate-900" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-2xl font-semibold text-slate-900">Everything you need for CAT mocks</h2>
            <p className="mt-3 text-slate-600">
              Reliable timers, locked sections, and detailed insights designed for focused practice.
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: 'Authentic timers',
                  desc: 'Section-wise timers with automatic transitions and lock-in behavior.',
                },
                {
                  title: 'Section transitions',
                  desc: 'Sequential navigation ensures exam-like pressure and focus.',
                },
                {
                  title: 'Performance analytics',
                  desc: 'Review attempts with time spent, visits, and question-level insights.',
                },
                {
                  title: 'Mobile-friendly',
                  desc: 'Clean, responsive layout for practice on any device.',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">How it works</h2>
              <p className="mt-3 text-slate-600">
                Three simple steps to start practicing like it is exam day.
              </p>
            </div>
            <div className="grid gap-6">
              {[
                {
                  step: '01',
                  title: 'Sign in and select a mock',
                  desc: 'Choose from available CAT mocks and start instantly.',
                },
                {
                  step: '02',
                  title: 'Attempt under real conditions',
                  desc: 'Section timers guide you through VARC, DILR, and QA.',
                },
                {
                  step: '03',
                  title: 'Review detailed insights',
                  desc: 'Analyze accuracy, time spent, and revisit questions.',
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Trusted by serious aspirants</h2>
                <p className="mt-3 text-slate-600">
                  Placeholder testimonials and partner logos. Swap with real proof as soon as available.
                </p>
                <div className="mt-6 grid gap-4">
                  {['“Best CAT mock experience.”', '“Timers and sections feel real.”', '“Love the analytics.”'].map(
                    (quote) => (
                      <div key={quote} className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                        {quote}
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {['Partner A', 'Partner B', 'Partner C', 'Partner D'].map((label) => (
                  <div
                    key={label}
                    className="flex h-20 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm font-semibold text-slate-400"
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Frequently asked questions</h2>
              <p className="mt-3 text-slate-600">
                Placeholder FAQs. Replace with real answers as the product evolves.
              </p>
            </div>
            <div className="space-y-4">
              {[
                'Do mocks match CAT section timing?',
                'Can I review answers after submission?',
                'How are scores calculated?',
                'Is mobile supported?',
              ].map((question) => (
                <details key={question} className="rounded-lg border border-slate-200 bg-white p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                    {question}
                  </summary>
                  <p className="mt-2 text-sm text-slate-600">
                    Placeholder answer. Provide full details once finalized.
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 text-sm text-slate-600 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-base font-semibold text-slate-900">CAT Mock Arena</div>
            <p className="mt-2 max-w-xs">
              A clean, focused CAT mock experience with real exam constraints.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <a className="hover:text-slate-900" href="/mocks">Mocks</a>
            <a className="hover:text-slate-900" href="/auth/sign-in">Sign in</a>
            <a className="hover:text-slate-900" href="/dashboard">Dashboard</a>
            <a className="hover:text-slate-900" href="#">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
