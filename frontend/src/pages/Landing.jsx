import { Link } from "react-router-dom";
import { BarChart3, Users, CheckSquare, Calendar } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#ECECEC] text-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <header className="flex items-center justify-between mb-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1F1F1F] flex items-center justify-center text-white font-semibold">
              T
            </div>
            <span className="text-lg font-display font-semibold tracking-tight">
              TeamSync
            </span>
          </div>

          <Link
            to="/login"
            className="px-5 py-2 rounded-xl bg-[#1F1F1F] text-white text-sm font-medium hover:opacity-90 transition"
          >
            Sign In
          </Link>
        </header>

        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <div>
            <h1 className="text-5xl font-display font-semibold leading-tight mb-6">
              A calmer way to
              <br />
              manage remote teams
            </h1>

            <p className="text-gray-600 text-lg leading-relaxed mb-10 max-w-xl">
              TeamSync brings tasks, collaboration, and progress tracking
              into one unified workspace designed for modern remote teams.
            </p>

            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="px-7 py-3 rounded-xl bg-[#1F1F1F] text-white font-medium hover:opacity-90 transition"
              >
                Get Started
              </Link>

              <button className="px-7 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-white transition">
                Learn More
              </button>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative">
            <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl p-6">
              {/* Mini Dashboard */}
              <div className="h-80 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 overflow-hidden">
                {/* Mini Navbar */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200/60">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-lg bg-[#1F1F1F] flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">T</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">TeamSync</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                    <div className="w-12 h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>

                {/* Mini Content */}
                <div className="flex space-x-3 h-48">
                  {/* Mini Sidebar */}
                  <div className="w-16 bg-white/40 backdrop-blur-sm rounded-xl p-2 space-y-2">
                    <div className="w-full h-6 bg-white/60 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-3 h-3 text-gray-600" />
                    </div>
                    <div className="w-full h-6 bg-white/30 rounded-lg flex items-center justify-center">
                      <Users className="w-3 h-3 text-gray-600" />
                    </div>
                    <div className="w-full h-6 bg-white/30 rounded-lg flex items-center justify-center">
                      <CheckSquare className="w-3 h-3 text-gray-600" />
                    </div>
                    <div className="w-full h-6 bg-white/30 rounded-lg flex items-center justify-center">
                      <Calendar className="w-3 h-3 text-gray-600" />
                    </div>
                  </div>

                  {/* Mini Main Content */}
                  <div className="flex-1 space-y-3">
                    {/* Mini Metrics */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-2">
                        <div className="text-xs text-gray-600">Teams</div>
                        <div className="text-sm font-bold text-gray-900">12</div>
                      </div>
                      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-2">
                        <div className="text-xs text-gray-600">Tasks</div>
                        <div className="text-sm font-bold text-gray-900">48</div>
                      </div>
                      <div className="bg-white/50 backdrop-blur-sm rounded-lg p-2">
                        <div className="text-xs text-gray-600">Done</div>
                        <div className="text-sm font-bold text-gray-900">32</div>
                      </div>
                    </div>

                    {/* Mini Kanban Board */}
                    <div className="bg-white/40 backdrop-blur-sm rounded-xl p-3">
                      <div className="text-xs font-medium text-gray-700 mb-2">Task Board</div>
                      <div className="grid grid-cols-3 gap-2 h-24">
                        {/* To Do Column */}
                        <div className="bg-white/30 rounded-lg p-2">
                          <div className="text-xs text-gray-600 mb-1">To Do</div>
                          <div className="space-y-1">
                            <div className="w-full h-3 bg-blue-100 rounded text-xs"></div>
                            <div className="w-full h-3 bg-yellow-100 rounded text-xs"></div>
                          </div>
                        </div>
                        
                        {/* In Progress Column */}
                        <div className="bg-white/30 rounded-lg p-2">
                          <div className="text-xs text-gray-600 mb-1">Progress</div>
                          <div className="space-y-1">
                            <div className="w-full h-3 bg-orange-100 rounded text-xs"></div>
                          </div>
                        </div>
                        
                        {/* Done Column */}
                        <div className="bg-white/30 rounded-lg p-2">
                          <div className="text-xs text-gray-600 mb-1">Done</div>
                          <div className="space-y-1">
                            <div className="w-full h-3 bg-green-100 rounded text-xs"></div>
                            <div className="w-full h-3 bg-green-100 rounded text-xs"></div>
                            <div className="w-full h-3 bg-green-100 rounded text-xs"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Badge */}
                <div className="absolute top-2 right-2">
                  <span className="text-xs bg-blue-100/60 text-blue-700 px-2 py-1 rounded-full font-medium">
                    Live Preview
                  </span>
                </div>
              </div>
            </div>

            {/* Floating Elements for Visual Appeal */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-200/60 rounded-full blur-sm"></div>
            <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-purple-200/40 rounded-full blur-sm"></div>
          </div>
        </section>

        {/* Features */}
        <section className="grid md:grid-cols-3 gap-10 mb-32">
          {[
            {
              title: "Task Boards",
              desc: "Visual Kanban boards with drag-and-drop task management.",
            },
            {
              title: "Team Activity",
              desc: "Real-time updates keep everyone aligned and informed.",
            },
            {
              title: "Role Based Access",
              desc: "Admins, Leads, and Members see only what they need.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/40 p-8 shadow-sm"
            >
              <h3 className="text-lg font-semibold mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="rounded-3xl bg-[#1F1F1F] text-white p-14 text-center">
          <h2 className="text-3xl font-semibold mb-4">
            Bring clarity to your team’s workflow
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Designed for focus, transparency, and calm productivity —
            TeamSync adapts to the way modern teams work.
          </p>

          <Link
            to="/login"
            className="inline-block px-8 py-3 rounded-xl bg-white text-[#1F1F1F] font-medium hover:opacity-90 transition"
          >
            Enter Dashboard
          </Link>
        </section>
      </div>
    </div>
  );
};

export default Landing;
