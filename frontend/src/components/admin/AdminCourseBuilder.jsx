import { useState, useEffect } from 'react';
import {
  Save,
  ArrowLeft,
  Image,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Video,
  UploadCloud,
  Trash2,
  PlayCircle,
  Clock,
  Check
} from 'lucide-react';
import api from '../../services/api';

const categories = [
  'Auth Concepts',
  'Website Content',
  'Business Analysis',
  'API Development',
  'Backend Basics',
  'Machine Learning',
  'Conversion Optimization',
  'Web Development'
];

const levels = ['Beginner', 'Intermediate', 'Advanced'];

const AdminCourseBuilder = ({ editingCourse, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Web Development',
    level: 'Beginner',
    description: '',
    instructorName: 'Crescentia Faculty',
    thumbnail: '',
    estimatedDuration: 12,
    targetAudience: 'Software engineers and aspiring developers',
    isPublished: true,
    learningOutcomes: ['Core principles and foundations', 'Real-world practical implementation'],
    prerequisites: ['Basic problem-solving skills'],
    videos: []
  });

  // Video Upload & Lesson State
  const [videoLesson, setVideoLesson] = useState({
    title: '',
    url: '',
    durationMinutes: 15
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [uploadErrorMsg, setUploadErrorMsg] = useState('');

  const [newOutcome, setNewOutcome] = useState('');
  const [newPrereq, setNewPrereq] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingCourse) {
      setFormData({
        title: editingCourse.title || '',
        category: editingCourse.category || 'Web Development',
        level: editingCourse.level || 'Beginner',
        description: editingCourse.description || '',
        instructorName: editingCourse.instructorName || 'Crescentia Faculty',
        thumbnail: editingCourse.thumbnail || '',
        estimatedDuration: editingCourse.estimatedDuration || 12,
        targetAudience: editingCourse.targetAudience || '',
        isPublished: editingCourse.isPublished !== undefined ? editingCourse.isPublished : true,
        learningOutcomes: editingCourse.learningOutcomes?.length ? editingCourse.learningOutcomes : ['Mastery of core concepts'],
        prerequisites: editingCourse.prerequisites?.length ? editingCourse.prerequisites : ['None required'],
        videos: Array.isArray(editingCourse.videos) ? editingCourse.videos : []
      });
    }
  }, [editingCourse]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setUploadSuccessMsg('');
    setUploadErrorMsg('');

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
      setVideoLesson((prev) => ({
        ...prev,
        url: uploadedUrl,
        title: prev.title.trim() ? prev.title : formattedTitle
      }));
      setUploadSuccessMsg(`Uploaded: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
    } catch (err) {
      setUploadErrorMsg(err.response?.data?.message || 'Video file upload failed. Please try again.');
    } finally {
      setUploadingFile(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleAddVideoLesson = () => {
    if (!videoLesson.title.trim()) {
      setUploadErrorMsg('Please provide a lesson title.');
      return;
    }
    if (!videoLesson.url.trim()) {
      setUploadErrorMsg('Please upload a video file or provide a video URL.');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      videos: [
        ...prev.videos,
        {
          title: videoLesson.title.trim(),
          url: videoLesson.url.trim(),
          durationMinutes: Number(videoLesson.durationMinutes) || 15
        }
      ]
    }));

    setVideoLesson({ title: '', url: '', durationMinutes: 15 });
    setUploadSuccessMsg('');
    setUploadErrorMsg('');
  };

  const handleRemoveVideoLesson = (index) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  const handleAddOutcome = () => {
    if (!newOutcome.trim()) return;
    setFormData((prev) => ({
      ...prev,
      learningOutcomes: [...prev.learningOutcomes, newOutcome.trim()]
    }));
    setNewOutcome('');
  };

  const handleRemoveOutcome = (index) => {
    setFormData((prev) => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.filter((_, i) => i !== index)
    }));
  };

  const handleAddPrereq = () => {
    if (!newPrereq.trim()) return;
    setFormData((prev) => ({
      ...prev,
      prerequisites: [...prev.prerequisites, newPrereq.trim()]
    }));
    setNewPrereq('');
  };

  const handleRemovePrereq = (index) => {
    setFormData((prev) => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please provide a course title and description.');
      setLoading(false);
      return;
    }

    try {
      if (editingCourse?._id) {
        await api.put(`/admin/courses/${editingCourse._id}`, formData);
        setMessage('Course updated successfully!');
      } else {
        await api.post('/admin/courses', formData);
        setMessage('Course created successfully!');
      }

      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="text-xs font-bold text-[#555555] hover:text-[#0056D2] flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        <h2 className="text-xl font-extrabold text-[#1F1F1F]">
          {editingCourse ? 'Edit Course Configuration' : 'Course Builder: Create New Course'}
        </h2>

        <div className="w-20" />
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Core Essentials */}
        <div className="bg-white border border-[#D1D7DC] rounded-lg p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0056D2] pb-2 border-b border-[#E0E0E0]">
            1. Core Course Information
          </h3>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#1F1F1F]">Course Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Full Stack Next.js & Modern Systems"
              className="w-full p-2.5 rounded border border-[#757575] focus:border-[#0056D2] focus:outline-none text-sm font-semibold"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#1F1F1F]">Subject / Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2.5 rounded border border-[#757575] focus:border-[#0056D2] focus:outline-none text-sm bg-white font-medium cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#1F1F1F]">Difficulty Level *</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full p-2.5 rounded border border-[#757575] focus:border-[#0056D2] focus:outline-none text-sm bg-white font-medium cursor-pointer"
              >
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#1F1F1F]">Instructor / Institution Partner</label>
              <input
                type="text"
                name="instructorName"
                value={formData.instructorName}
                onChange={handleChange}
                placeholder="e.g., Crescentia Academy or Stanford Online"
                className="w-full p-2.5 rounded border border-[#757575] focus:border-[#0056D2] focus:outline-none text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#1F1F1F]">Estimated Duration (Hours)</label>
              <input
                type="number"
                name="estimatedDuration"
                value={formData.estimatedDuration}
                onChange={handleChange}
                min="1"
                className="w-full p-2.5 rounded border border-[#757575] focus:border-[#0056D2] focus:outline-none text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#1F1F1F]">Course Overview & Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Provide an overview of the curriculum, real-world applications, and career relevance..."
              className="w-full p-2.5 rounded border border-[#757575] focus:border-[#0056D2] focus:outline-none text-sm"
              required
            />
          </div>
        </div>

        {/* Section 2: Media & Thumbnail */}
        <div className="bg-white border border-[#D1D7DC] rounded-lg p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0056D2] pb-2 border-b border-[#E0E0E0]">
            2. Course Thumbnail & Visual Asset
          </h3>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#1F1F1F]">Thumbnail Image URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/... or public image link"
                className="flex-1 p-2.5 rounded border border-[#757575] focus:border-[#0056D2] focus:outline-none text-sm"
              />
            </div>
          </div>

          {formData.thumbnail && (
            <div className="mt-2">
              <span className="text-xs text-[#555555] block mb-1">Preview:</span>
              <div className="w-56 aspect-video rounded overflow-hidden border border-[#D1D7DC] bg-slate-100">
                <img
                  src={formData.thumbnail}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Learning Outcomes & Prerequisites */}
        <div className="bg-white border border-[#D1D7DC] rounded-lg p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0056D2] pb-2 border-b border-[#E0E0E0]">
            3. Outcomes & Learning Objectives
          </h3>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#1F1F1F]">Skills & Outcomes Gained</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newOutcome}
                onChange={(e) => setNewOutcome(e.target.value)}
                placeholder="e.g., Modern REST API architecture"
                className="flex-1 p-2 text-sm rounded border border-[#757575]"
              />
              <button
                type="button"
                onClick={handleAddOutcome}
                className="px-4 py-2 bg-[#EBF3FF] text-[#0056D2] font-bold text-xs rounded hover:bg-blue-100"
              >
                Add Skill
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {formData.learningOutcomes.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 bg-[#F0F2F5] text-[#1F1F1F] text-xs font-semibold px-2.5 py-1 rounded border border-[#D1D7DC]"
                >
                  <span>{item}</span>
                  <X
                    className="w-3.5 h-3.5 cursor-pointer text-[#6A6F73] hover:text-[#DC2626]"
                    onClick={() => handleRemoveOutcome(idx)}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Course Video Lectures & Curriculum */}
        <div className="bg-white border border-[#D1D7DC] rounded-lg p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E0E0E0]">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#0056D2] flex items-center gap-2">
                <Video className="w-4 h-4" />
                <span>4. Course Curriculum & Video Uploads</span>
              </h3>
              <p className="text-xs text-[#555555] mt-0.5">
                Upload video lectures directly (MP4, WebM, MOV) or enter streaming URLs (Drive, Cloudinary, YouTube).
              </p>
            </div>
            <span className="text-xs font-bold text-[#0056D2] bg-[#EBF3FF] px-2.5 py-1 rounded">
              {formData.videos.length} {formData.videos.length === 1 ? 'Lesson' : 'Lessons'} Configured
            </span>
          </div>

          {/* Add Video Box */}
          <div className="bg-[#F8F9FA] border border-[#D1D7DC] rounded-md p-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F]">
              Add Video Lecture
            </h4>

            {uploadSuccessMsg && (
              <div className="p-2.5 bg-[#E6F4EA] border border-[#A8DAB5] text-[#0A8543] rounded text-xs font-medium flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{uploadSuccessMsg}</span>
              </div>
            )}

            {uploadErrorMsg && (
              <div className="p-2.5 bg-[#FDF2F2] border border-[#F87171] text-[#DC2626] rounded text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadErrorMsg}</span>
              </div>
            )}

            {/* Option A: Direct File Upload */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#1F1F1F]">
                Option A: Upload Video File from Device (MP4, WebM, MOV, MKV)
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[#757575] hover:border-[#0056D2] rounded cursor-pointer bg-white transition-colors">
                  <UploadCloud className="w-5 h-5 text-[#0056D2]" />
                  <span className="text-xs font-semibold text-[#1F1F1F]">
                    {uploadingFile ? 'Uploading video to server...' : 'Choose video file to upload'}
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
            </div>

            {/* Option B: Video Link / URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#1F1F1F]">
                Option B: Or Direct / Streamable Video URL
              </label>
              <input
                type="text"
                value={videoLesson.url}
                onChange={(e) => setVideoLesson((prev) => ({ ...prev, url: e.target.value }))}
                placeholder="https://... (direct .mp4 link, Google Drive preview link, or Cloudinary URL)"
                className="w-full p-2 text-xs rounded border border-[#757575] focus:border-[#0056D2] focus:outline-none bg-white"
              />
            </div>

            {/* Lesson Title & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-[#1F1F1F]">Lesson Title *</label>
                <input
                  type="text"
                  value={videoLesson.title}
                  onChange={(e) => setVideoLesson((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., 01. Introduction to Core Concepts"
                  className="w-full p-2 text-xs rounded border border-[#757575] focus:border-[#0056D2] focus:outline-none bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1F1F1F]">Duration (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={videoLesson.durationMinutes}
                  onChange={(e) => setVideoLesson((prev) => ({ ...prev, durationMinutes: e.target.value }))}
                  className="w-full p-2 text-xs rounded border border-[#757575] focus:border-[#0056D2] focus:outline-none bg-white"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddVideoLesson}
              disabled={uploadingFile}
              className="px-4 py-2 bg-[#0056D2] hover:bg-[#00419e] text-white font-bold text-xs rounded cursor-pointer transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Video Lesson</span>
            </button>
          </div>

          {/* Curriculum Lessons List */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#1F1F1F]">
              Current Course Lessons ({formData.videos.length})
            </label>

            {formData.videos.length === 0 ? (
              <div className="p-4 border border-dashed border-[#D1D7DC] rounded text-center text-xs text-[#555555] bg-gray-50">
                No video lessons attached yet. Upload a video file or enter a video URL above to build this course's curriculum.
              </div>
            ) : (
              <div className="space-y-2">
                {formData.videos.map((vid, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded border border-[#D1D7DC] bg-white hover:border-[#0056D2] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded bg-[#EBF3FF] text-[#0056D2] font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#1F1F1F] truncate">
                          {vid.title}
                        </div>
                        <div className="text-[11px] text-[#555555] flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#555555]" />
                            {vid.durationMinutes || 15} min
                          </span>
                          <span>•</span>
                          <span className="truncate max-w-xs text-[#0056D2]">
                            {vid.url}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveVideoLesson(idx)}
                      className="p-1.5 text-[#6A6F73] hover:text-[#DC2626] rounded hover:bg-red-50 transition-colors"
                      title="Remove lesson"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Publishing Settings */}
        <div className="bg-white border border-[#D1D7DC] rounded-lg p-6 shadow-xs flex items-center justify-between">
          <div>
            <div className="font-bold text-sm text-[#1F1F1F]">Publish to Catalog Immediately</div>
            <div className="text-xs text-[#555555]">Make this course visible to students and guests upon saving</div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-[#0056D2]" />
          </label>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="coursera-btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="coursera-btn-primary"
          >
            <Save className="w-4 h-4 mr-2" />
            <span>{loading ? 'Saving...' : editingCourse ? 'Save Changes' : 'Create & Launch Course'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCourseBuilder;
