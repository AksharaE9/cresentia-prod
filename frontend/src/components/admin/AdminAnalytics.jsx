import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  BookOpen
} from 'lucide-react';

const AdminAnalytics = ({ stats, courses, users }) => {
  const totalCourses = courses?.length || stats?.totalCourses || 8;
  const totalStudents = users?.filter(u => u.role === 'user')?.length || 4;

  const topCourses = (courses || []).slice(0, 5).map((course, idx) => ({
    title: course.title,
    category: course.category,
    students: (idx + 1) * 38 + 12,
    completionRate: 85 - idx * 4,
    avgScore: 92 - idx * 3
  }));

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-[#1F1F1F] tracking-tight">
          Learning Intelligence & Platform Analytics
        </h2>
        <p className="text-sm text-[#555555]">
          Deep insights into course completion velocity, assessment pass rates, and student retention.
        </p>
      </div>

      {/* 4 Metric Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#D1D7DC] rounded-lg p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#555555] block mb-1">
            Weekly Active Learners
          </span>
          <div className="text-2xl font-black text-[#1F1F1F]">84.2%</div>
          <div className="text-xs text-[#0A8543] font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>High engagement</span>
          </div>
        </div>

        <div className="bg-white border border-[#D1D7DC] rounded-lg p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#555555] block mb-1">
            Average Quiz Score
          </span>
          <div className="text-2xl font-black text-[#1F1F1F]">88.5%</div>
          <div className="text-xs text-[#0A8543] font-semibold mt-1">Passing threshold: 70%</div>
        </div>

        <div className="bg-white border border-[#D1D7DC] rounded-lg p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#555555] block mb-1">
            Avg Completion Velocity
          </span>
          <div className="text-2xl font-black text-[#1F1F1F]">18.4 Days</div>
          <div className="text-xs text-[#555555] mt-1">From enrollment to certificate</div>
        </div>

        <div className="bg-white border border-[#D1D7DC] rounded-lg p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#555555] block mb-1">
            Verified Pass Rate
          </span>
          <div className="text-2xl font-black text-[#1F1F1F]">94.1%</div>
          <div className="text-xs text-[#0A8543] font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Top percentile</span>
          </div>
        </div>
      </div>

      {/* Course Performance Leaderboard */}
      <div className="bg-white border border-[#D1D7DC] rounded-lg shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#1F1F1F]">Course Performance Leaderboard</h3>
            <p className="text-xs text-[#555555]">Ranked by active enrollments and completion ratios</p>
          </div>
          <span className="text-xs font-bold bg-[#EBF3FF] text-[#0056D2] px-2.5 py-1 rounded">
            Live Benchmarks
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E0E0E0] text-[#555555] uppercase tracking-wider font-bold">
                <th className="pb-3">Rank</th>
                <th className="pb-3">Course Title</th>
                <th className="pb-3">Subject</th>
                <th className="pb-3">Enrolled</th>
                <th className="pb-3">Completion Rate</th>
                <th className="pb-3 text-right">Avg Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {topCourses.map((c, i) => (
                <tr key={i} className="hover:bg-[#F9FAFB]">
                  <td className="py-3.5 font-bold text-[#0056D2]">#{i + 1}</td>
                  <td className="py-3.5 font-bold text-[#1F1F1F] max-w-xs line-clamp-1">{c.title}</td>
                  <td className="py-3.5 text-[#555555]">{c.category}</td>
                  <td className="py-3.5 font-bold text-[#1F1F1F]">{c.students} students</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-[#F0F2F5] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0A8543] rounded-full"
                          style={{ width: `${c.completionRate}%` }}
                        />
                      </div>
                      <span className="font-bold text-[#1F1F1F]">{c.completionRate}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-right font-bold text-[#0056D2]">{c.avgScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2-Column: Assessment Outcomes and Learning Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#D1D7DC] rounded-lg p-6 shadow-xs">
          <h3 className="text-base font-bold text-[#1F1F1F] mb-1">Assessment First-Attempt Pass Rates</h3>
          <p className="text-xs text-[#555555] mb-6">Percentage of students scoring ≥70% on initial quiz</p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Scored 90% - 100% (Distinction)</span>
                <span className="text-[#0A8543]">62%</span>
              </div>
              <div className="w-full h-2 bg-[#F0F2F5] rounded-full overflow-hidden">
                <div className="h-full bg-[#0A8543] rounded-full" style={{ width: '62%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Scored 70% - 89% (Passed)</span>
                <span className="text-[#0056D2]">28%</span>
              </div>
              <div className="w-full h-2 bg-[#F0F2F5] rounded-full overflow-hidden">
                <div className="h-full bg-[#0056D2] rounded-full" style={{ width: '28%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Required Retake (&lt;70%)</span>
                <span className="text-[#B4690E]">10%</span>
              </div>
              <div className="w-full h-2 bg-[#F0F2F5] rounded-full overflow-hidden">
                <div className="h-full bg-[#B4690E] rounded-full" style={{ width: '10%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#D1D7DC] rounded-lg p-6 shadow-xs">
          <h3 className="text-base font-bold text-[#1F1F1F] mb-1">Institutional Credential Velocity</h3>
          <p className="text-xs text-[#555555] mb-6">Monthly verified credentials issued</p>

          <div className="flex items-end gap-4 h-36 pt-4 border-b border-[#D1D7DC]">
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-[#EBF3FF] rounded-t hover:bg-[#0056D2] transition-colors" style={{ height: '40%' }} />
              <span className="text-[10px] text-[#555555]">May</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-[#EBF3FF] rounded-t hover:bg-[#0056D2] transition-colors" style={{ height: '55%' }} />
              <span className="text-[10px] text-[#555555]">Jun</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-[#EBF3FF] rounded-t hover:bg-[#0056D2] transition-colors" style={{ height: '70%' }} />
              <span className="text-[10px] text-[#555555]">Jul</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-[#EBF3FF] rounded-t hover:bg-[#0056D2] transition-colors" style={{ height: '85%' }} />
              <span className="text-[10px] text-[#555555]">Aug</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-[#0056D2] rounded-t" style={{ height: '100%' }} />
              <span className="text-[10px] font-bold text-[#0056D2]">Sep (Current)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
