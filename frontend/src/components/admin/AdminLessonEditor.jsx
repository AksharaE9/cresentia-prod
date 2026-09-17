import { useState, useEffect } from 'react';
import {
  Video,
  Plus,
  Trash2,
  Edit3,
  Save,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Layers,
  Clock,
  PlayCircle,
  FileQuestion,
  ArrowLeft,
  UploadCloud,
  Check
} from 'lucide-react';
import api from '../../services/api';

const AdminLessonEditor = ({ courses, initialCourse, onBack, onRefresh }) => {
  const [selectedCourseId, setSelectedCourseId] = useState(
    initialCourse?._id || courses?.[0]?._id || ''
  );
  const [currentCourse, setCurrentCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('lessons'); // 'lessons' | 'quiz'

  // New Video Form State
  const [newVideo, setNewVideo] = useState({
    title: '',
    url: '',
    durationMinutes: 15
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  // New Question Form State
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Load course details when course is selected
  useEffect(() => {
    if (!selectedCourseId) return;
    const found = courses?.find((c) => c._id === selectedCourseId);
    if (found) {
      setCurrentCourse(found);
      setVideos(found.videos || []);
      setQuizQuestions(found.quizQuestions || []);
    }
  }, [selectedCourseId, courses]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setUploadSuccessMsg('');
    setError('');

    const uploadData = new FormData();
    uploadData.append('video', file);

    try {
      const res = await api.post('/uploads/video-file', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const uploadedUrl = res.data.url;
      const formattedTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setNewVideo((prev) => ({
        ...prev,
        url: uploadedUrl,
        title: prev.title.trim() ? prev.title : formattedTitle
      }));
      setUploadSuccessMsg(`Uploaded: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
    } catch (err) {
      setError(err.response?.data?.message || 'Video file upload failed.');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const handleAddVideo = () => {
    if (!newVideo.title.trim() || !newVideo.url.trim()) {
      setError('Please provide a lesson title and video URL or upload a video file.');
      return;
    }

    const updated = [
      ...videos,
      {
        title: newVideo.title.trim(),
        url: newVideo.url.trim(),
        durationMinutes: Number(newVideo.durationMinutes) || 15
      }
    ];

    setVideos(updated);
    setNewVideo({ title: '', url: '', durationMinutes: 15 });
    setUploadSuccessMsg('');
    setError('');
  };

  const handleRemoveVideo = (index) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handleOptionChange = (idx, value) => {
    const updated = [...newQuestion.options];
    updated[idx] = value;
    setNewQuestion((prev) => ({ ...prev, options: updated }));
  };

  const handleAddQuestion = () => {
    if (!newQuestion.question.trim()) {
      setError('Question prompt is required.');
      return;
    }
    if (newQuestion.options.some((opt) => !opt.trim())) {
      setError('All 4 question options must be filled out.');
      return;
    }

    const updated = [
      ...quizQuestions,
      {
        question: newQuestion.question.trim(),
        options: newQuestion.options.map((o) => o.trim()),
        correctAnswer: Number(newQuestion.correctAnswer),
        explanation: newQuestion.explanation.trim()
      }
    ];

    setQuizQuestions(updated);
    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    });
    setError('');
  };

  const handleRemoveQuestion = (index) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  };

  const handleSaveCurriculum = async () => {
    if (!selectedCourseId) return;
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.put(`/admin/courses/${selectedCourseId}`, {
        videos,
        quizQuestions
      });

      setMessage('Course curriculum and assessment saved successfully!');
      await onRefresh();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update curriculum.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="text-xs font-bold text-[#555555] hover:text-[#0056D2] flex items-center gap-1 mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Courses</span>
          </button>
          <h2 className="text-2xl font-extrabold text-[#1F1F1F] tracking-tight">
            Curriculum & Lesson Editor
          </h2>
          <p className="text-sm text-[#555555]">
            Manage video lessons, duration metadata, and final assessment quizzes.
          </p>
        </div>

        {/* Course Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#555555]">Target Course:</span>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="py-2 px-3 rounded border border-[#757575] bg-white text-xs font-bold text-[#1F1F1F] focus:border-[#0056D2] focus:outline-none min-w-[220px]"
          >
            {(courses || []).map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-[#E6F4EA] border border-[#A8DAB5] text-[#0A8543] rounded-md text-sm font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-[#FDF2F2] border border-[#F87171] text-[#DC2626] rounded-md text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Sub Tabs: Lessons vs Assessment */}
      <div className="flex border-b border-[#D1D7DC]">
        <button
          onClick={() => setActiveSubTab('lessons')}
          className={`px-5 py-3 text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'lessons'
              ? 'border-[#0056D2] text-[#0056D2]'
              : 'border-transparent text-[#555555] hover:text-[#1F1F1F]'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Video Lessons ({videos.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('quiz')}
          className={`px-5 py-3 text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'quiz'
              ? 'border-[#0056D2] text-[#0056D2]'
              : 'border-transparent text-[#555555] hover:text-[#1F1F1F]'
          }`}
        >
          <FileQuestion className="w-4 h-4" />
          <span>Final Quiz Questions ({quizQuestions.length})</span>
        </button>
      </div>

      {/* SUBTAB 1: Video Lessons */}
      {activeSubTab === 'lessons' && (
        <div className="space-y-6">
          {/* Add Video Form */}
          <div className="bg-white border border-[#D1D7DC] rounded-lg p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0056D2] flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span>+ Add Video Lesson to Curriculum</span>
            </h3>

            {uploadSuccessMsg && (
              <div className="p-2.5 bg-[#E6F4EA] border border-[#A8DAB5] text-[#0A8543] rounded text-xs font-medium flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{uploadSuccessMsg}</span>
              </div>
            )}

            {/* Direct File Upload Option */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#1F1F1F]">
                Upload Video File (MP4, WebM, MOV, MKV)
              </label>
              <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[#757575] hover:border-[#0056D2] rounded cursor-pointer bg-[#F8F9FA] transition-colors">
                <UploadCloud className="w-5 h-5 text-[#0056D2]" />
                <span className="text-xs font-semibold text-[#1F1F1F]">
                  {uploadingFile ? 'Uploading video to server...' : 'Choose video file to upload directly'}
                </span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#1F1F1F]">Or Direct Video URL / Google Drive</label>
              <input
                type="text"
                value={newVideo.url}
                onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                placeholder="https://... or Google Drive preview link"
                className="w-full p-2 text-xs rounded border border-[#757575] focus:border-[#0056D2] bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-[#1F1F1F]">Lesson Title *</label>
                <input
                  type="text"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  placeholder="e.g., Module 1: Architecture Overview"
                  className="w-full p-2 text-xs rounded border border-[#757575] focus:border-[#0056D2] bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1F1F1F]">Duration (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={newVideo.durationMinutes}
                  onChange={(e) => setNewVideo({ ...newVideo, durationMinutes: e.target.value })}
                  className="w-full p-2 text-xs rounded border border-[#757575] focus:border-[#0056D2] bg-white"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddVideo}
              disabled={uploadingFile}
              className="px-4 py-2 bg-[#0056D2] text-white text-xs font-bold rounded hover:bg-[#00419E] transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lesson to List</span>
            </button>
          </div>

          {/* Existing Lessons List */}
          <div className="bg-white border border-[#D1D7DC] rounded-lg shadow-xs overflow-hidden">
            <div className="p-4 bg-[#F8F9FA] border-b border-[#D1D7DC] flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#555555]">
                Current Curriculum Order ({videos.length} Lessons)
              </span>
              <span className="text-xs text-[#555555]">
                Total Duration: {videos.reduce((sum, v) => sum + Number(v.durationMinutes || 0), 0)} mins
              </span>
            </div>

            <div className="divide-y divide-[#E0E0E0]">
              {videos.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#555555]">
                  No lessons added to this course yet. Use the form above to add lessons.
                </div>
              ) : (
                videos.map((video, index) => (
                  <div key={index} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#EBF3FF] text-[#0056D2] font-bold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#1F1F1F] flex items-center gap-2">
                          <span>{video.title}</span>
                        </div>
                        <div className="text-xs text-[#6A6F73] flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {video.durationMinutes} mins
                          </span>
                          <span className="line-clamp-1 max-w-md font-mono text-[11px] text-[#555555]">
                            {video.url}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveVideo(index)}
                      className="p-1.5 text-[#DC2626] hover:bg-red-50 rounded"
                      title="Remove Lesson"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Final Quiz Questions */}
      {activeSubTab === 'quiz' && (
        <div className="space-y-6">
          {/* Add Question Form */}
          <div className="bg-white border border-[#D1D7DC] rounded-lg p-6 shadow-xs space-y-5">
            <div className="border-b border-[#E0E0E0] pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#EBF3FF] text-[#0056D2] flex items-center justify-center shrink-0">
                  <FileQuestion className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1F1F1F]">
                    Add Assessment Question
                  </h3>
                  <p className="text-xs text-[#555555]">
                    Multiple-choice questions for the end-of-course exam required for certificate issuance.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#F0F2F5] text-[#555555]">
                {quizQuestions.length} in Exam
              </span>
            </div>

            {/* Question Prompt */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#1F1F1F]">
                  Question Prompt <span className="text-red-600">*</span>
                </label>
                <span className="text-[11px] text-[#757575]">Clear and unambiguous question</span>
              </div>
              <input
                type="text"
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                placeholder="e.g., Which hook is used for managing side-effects in a React component?"
                className="w-full px-3.5 py-2.5 text-sm rounded border border-[#757575] focus:border-[#0056D2] focus:outline-none transition-colors"
              />
            </div>

            {/* 4 Multiple Choice Options */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#1F1F1F]">
                  Answer Choices (4 Options) <span className="text-red-600">*</span>
                </label>
                <span className="text-[11px] text-[#0056D2] font-semibold">
                  ● Mark the radio button of the correct answer
                </span>
              </div>

              <div className="space-y-2.5">
                {newQuestion.options.map((option, optIdx) => {
                  const isSelected = newQuestion.correctAnswer === optIdx;
                  const letter = String.fromCharCode(65 + optIdx);
                  return (
                    <div
                      key={optIdx}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-[#EBF3FF] border-[#0056D2] shadow-xs'
                          : 'bg-white border-[#D1D7DC] hover:border-[#9E9E9E]'
                      }`}
                    >
                      <label
                        className="flex items-center gap-2.5 cursor-pointer shrink-0"
                        title={`Select Option ${letter} as the correct answer`}
                      >
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={isSelected}
                          onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: optIdx })}
                          className="w-4 h-4 text-[#0056D2] cursor-pointer"
                        />
                        <span
                          className={`w-7 h-7 rounded-md font-bold text-xs flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-[#0056D2] text-white shadow-xs'
                              : 'bg-[#F0F2F5] text-[#555555]'
                          }`}
                        >
                          {letter}
                        </span>
                      </label>

                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(optIdx, e.target.value)}
                        placeholder={`Option ${letter} text...`}
                        className="w-full flex-1 min-w-0 px-3 py-2 text-sm rounded border border-[#D1D7DC] bg-white focus:border-[#0056D2] focus:outline-none transition-colors"
                      />

                      {isSelected ? (
                        <span className="shrink-0 text-xs font-bold text-[#0056D2] bg-white border border-[#C2DCFF] px-2.5 py-1 rounded flex items-center gap-1 shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                          <span>Correct Answer</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setNewQuestion({ ...newQuestion, correctAnswer: optIdx })}
                          className="shrink-0 text-xs text-[#757575] hover:text-[#0056D2] font-semibold px-2 py-1 rounded hover:bg-[#F5F7FA] transition-colors"
                        >
                          Set Correct
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explanation Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#1F1F1F]">
                  Explanation (Optional)
                </label>
                <span className="text-[11px] text-[#757575]">
                  Shown to students after completing the assessment
                </span>
              </div>
              <input
                type="text"
                value={newQuestion.explanation}
                onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                placeholder="e.g., useEffect is specifically designed to perform side effects like subscriptions and timers."
                className="w-full px-3 py-2 text-sm rounded border border-[#757575] focus:border-[#0056D2] focus:outline-none transition-colors"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleAddQuestion}
                className="coursera-btn-primary flex items-center gap-2 px-5 py-2.5 text-xs font-bold shadow-xs hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question to Assessment</span>
              </button>

              <span className="text-xs text-[#757575]">
                {4 - newQuestion.options.filter((o) => o.trim()).length > 0
                  ? `${4 - newQuestion.options.filter((o) => o.trim()).length} option(s) remaining`
                  : 'Ready to add'}
              </span>
            </div>
          </div>

          {/* Existing Quiz Questions List */}
          <div className="bg-white border border-[#D1D7DC] rounded-lg shadow-xs overflow-hidden">
            <div className="p-4 bg-[#F8F9FA] border-b border-[#D1D7DC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileQuestion className="w-4 h-4 text-[#0056D2]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F]">
                  Final Assessment Questions ({quizQuestions.length})
                </span>
              </div>
              <span className="text-xs text-[#555555]">
                {quizQuestions.length >= 3
                  ? '✓ Assessment ready for students'
                  : `Recommendation: Add at least ${Math.max(0, 3 - quizQuestions.length)} more question(s)`}
              </span>
            </div>

            <div className="divide-y divide-[#E0E0E0]">
              {quizQuestions.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#F0F2F5] text-[#757575] flex items-center justify-center mx-auto">
                    <FileQuestion className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-[#1F1F1F]">
                    No assessment questions added yet
                  </div>
                  <div className="text-xs text-[#555555] max-w-sm mx-auto">
                    Create multiple-choice questions above to test students' mastery before they receive their course certificate.
                  </div>
                </div>
              ) : (
                quizQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="p-5 space-y-3 hover:bg-[#FBFBFC] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#EBF3FF] text-[#0056D2] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {qIdx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-sm text-[#1F1F1F] leading-snug">
                            {q.question}
                          </div>
                          {q.explanation && (
                            <div className="mt-1 text-xs text-[#555555] bg-[#F5F7FA] px-2.5 py-1.5 rounded border border-[#E0E0E0] inline-block">
                              <span className="font-semibold text-[#1F1F1F]">Explanation:</span> {q.explanation}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="p-1.5 text-[#DC2626] hover:bg-red-50 rounded transition-colors shrink-0"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 pl-9">
                      {q.options?.map((opt, oIdx) => {
                        const isCorrect = oIdx === q.correctAnswer;
                        const letter = String.fromCharCode(65 + oIdx);
                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-md border flex items-center justify-between gap-2 ${
                              isCorrect
                                ? 'bg-[#E6F4EA] border-[#A8DAB5] text-[#0A8543] font-semibold'
                                : 'bg-white border-[#E0E0E0] text-[#1F1F1F]'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`w-5 h-5 rounded text-[11px] font-bold flex items-center justify-center shrink-0 ${
                                  isCorrect
                                    ? 'bg-[#0A8543] text-white'
                                    : 'bg-[#F0F2F5] text-[#555555]'
                                }`}
                              >
                                {letter}
                              </span>
                              <span className="truncate">{opt}</span>
                            </div>
                            {isCorrect && (
                              <span className="text-[11px] font-bold shrink-0 flex items-center gap-0.5">
                                <Check className="w-3.5 h-3.5" /> Correct
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save All Curriculum Changes Bar */}
      <div className="sticky bottom-4 bg-white border border-[#D1D7DC] rounded-lg p-4 shadow-md flex items-center justify-between">
        <div className="text-xs text-[#555555]">
          Make sure to click save to synchronize lessons and assessment questions with the course.
        </div>

        <button
          onClick={handleSaveCurriculum}
          disabled={loading}
          className="coursera-btn-primary"
        >
          <Save className="w-4 h-4 mr-2" />
          <span>{loading ? 'Saving...' : 'Save Curriculum Changes'}</span>
        </button>
      </div>
    </div>
  );
};

export default AdminLessonEditor;
