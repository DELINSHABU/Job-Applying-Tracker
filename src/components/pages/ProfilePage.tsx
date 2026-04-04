import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { pageVariants } from '../../lib/animations';
import { useProfile } from '../../hooks/useProfile';
import type { User, Job } from '../../types';

interface ProfilePageProps {
  user: User;
  jobs: Job[];
  onBack: () => void;
  onLogout: () => void;
}

export function ProfilePage({ user, jobs, onBack, onLogout }: ProfilePageProps) {
  const { profile, updateProfile } = useProfile(user.uid, user.email, user.displayName);
  const [isEditing, setIsEditing] = useState(false);
  const [profession, setProfession] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvPreview, setCvPreview] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfession(profile.profession || '');
      setPhone(profile.phone || '');
      setLocation(profile.location || '');
      setSkills(profile.skills || []);
      setCvPreview(profile.cvUrl || undefined);
    }
  }, [profile]);

  const getInitials = (user: User) => {
    if (user.displayName) {
      return user.displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.charAt(0).toUpperCase() || '?';
  };

  const totalApplications = jobs.length;
  const interviewRate = totalApplications > 0 
    ? Math.round((jobs.filter(j => j.status === 'interviewing' || j.status === 'callback').length / totalApplications) * 100) 
    : 0;
  const offerRate = totalApplications > 0 
    ? Math.round((jobs.filter(j => j.status === 'offer').length / totalApplications) * 100) 
    : 0;

  const earliestJob = jobs.length > 0 
    ? jobs.reduce((earliest, job) => {
        const jobDate = new Date(job.createdAt);
        return jobDate < new Date(earliest.createdAt) ? job : earliest;
      })
    : null;
  const memberSince = earliestJob 
    ? new Date(earliestJob.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        profession,
        phone,
        location,
        skills,
        cvUrl: cvPreview || undefined,
      });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Keep CV under 1MB encoded (Firestore 1MB doc limit; base64 adds ~33% overhead)
      if (file.size > 700 * 1024) {
        toast.error('CV must be under 700KB. Consider compressing it before uploading.');
        return;
      }
      setCvFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCvPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCv = () => {
    setCvFile(null);
    setCvPreview(undefined);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-app-bg-light dark:bg-app-bg"
    >
      {/* Header */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-5 py-4 bg-app-bg-light/80 dark:bg-app-bg/80 backdrop-blur-md border-b border-slate-200 dark:border-card-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
          aria-label="Go back"
        >
          <span className="material-icons-round">arrow_back_ios_new</span>
        </Button>
        <span className="text-sm font-semibold tracking-wide uppercase text-slate-500 dark:text-light-grey">Profile</span>
        {profile && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-primary"
          >
            Edit
          </Button>
        )}
        {isEditing && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setProfession(profile?.profession || '');
                setPhone(profile?.phone || '');
                setLocation(profile?.location || '');
                setSkills(profile?.skills || []);
                setCvPreview(profile?.cvUrl || undefined);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
      </nav>

      <main className="px-5 pt-4 pb-8 space-y-6 max-w-lg mx-auto">
        {/* Profile Header */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'Profile'} 
                className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-card-bg shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold border-4 border-white dark:border-card-bg shadow-xl">
                {getInitials(user)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-4 border-app-bg-light dark:border-app-bg rounded-full flex items-center justify-center">
              <span className="material-icons-round text-white text-sm">check</span>
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-off-white">
              {user.displayName || 'User'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-light-grey">{user.email}</p>
            <p className="text-xs text-slate-400 dark:text-light-grey/70">Member since {memberSince}</p>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-3 gap-3">
          <Card className="bg-white dark:bg-card-bg border-slate-200 dark:border-card-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{totalApplications}</p>
              <p className="text-xs text-slate-500 dark:text-light-grey">Applications</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-card-bg border-slate-200 dark:border-card-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-500">{interviewRate}%</p>
              <p className="text-xs text-slate-500 dark:text-light-grey">Interview Rate</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-card-bg border-slate-200 dark:border-card-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-500">{offerRate}%</p>
              <p className="text-xs text-slate-500 dark:text-light-grey">Offer Rate</p>
            </CardContent>
          </Card>
        </section>

        {/* Professional Info */}
        <section className="space-y-3">
          <h3 className="px-1 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">Professional Info</h3>
          <Card className="bg-white dark:bg-card-bg border-slate-200 dark:border-card-border overflow-hidden">
            <CardContent className="p-0">
              {/* Profession */}
              <div className="p-4 border-b border-slate-100 dark:border-card-border">
                <label className="text-xs text-slate-500 dark:text-light-grey mb-1 block">Profession</label>
                {isEditing ? (
                  <Input
                    placeholder="e.g., Software Engineer, Data Analyst..."
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                  />
                ) : (
                  <p className="font-medium text-slate-900 dark:text-off-white">
                    {profile?.profession || 'Not set'}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="p-4 border-b border-slate-100 dark:border-card-border">
                <label className="text-xs text-slate-500 dark:text-light-grey mb-1 block">Phone</label>
                {isEditing ? (
                  <Input
                    type="tel"
                    placeholder="e.g., +1 555 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                ) : (
                  <p className="font-medium text-slate-900 dark:text-off-white">
                    {profile?.phone || 'Not set'}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="p-4 border-b border-slate-100 dark:border-card-border">
                <label className="text-xs text-slate-500 dark:text-light-grey mb-1 block">Location</label>
                {isEditing ? (
                  <Input
                    placeholder="e.g., New York, Remote, Dubai..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                ) : (
                  <p className="font-medium text-slate-900 dark:text-off-white">
                    {profile?.location || 'Not set'}
                  </p>
                )}
              </div>

              {/* Skills */}
              <div className="p-4 border-b border-slate-100 dark:border-card-border">
                <label className="text-xs text-slate-500 dark:text-light-grey mb-2 block">Skills</label>
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill..."
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                      />
                      <Button size="sm" onClick={handleAddSkill}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {skills.map(skill => (
                        <Badge key={skill} variant="secondary" className="pr-1">
                          {skill}
                          <button onClick={() => handleRemoveSkill(skill)} className="ml-1 hover:text-red-500">
                            <span className="material-icons-round text-sm">close</span>
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {profile?.skills && profile.skills.length > 0 ? (
                      profile.skills.map(skill => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400">No skills added</p>
                    )}
                  </div>
                )}
              </div>

              {/* CV Upload */}
              <div className="p-4">
                <label className="text-xs text-slate-500 dark:text-light-grey mb-2 block">Resume / CV</label>
                {isEditing ? (
                  <div className="space-y-2">
                    {cvPreview ? (
                      <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-card-border rounded-lg">
                        <span className="material-icons-round text-primary">description</span>
                        <span className="text-sm text-slate-600 dark:text-light-grey flex-1 truncate">
                          {cvFile?.name || 'CV uploaded'}
                        </span>
                        <button onClick={removeCv} className="text-red-500 hover:text-red-600">
                          <span className="material-icons-round text-sm">delete</span>
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-slate-200 dark:border-card-border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,image/*"
                          onChange={handleCvUpload}
                          className="hidden"
                        />
                        <span className="material-icons-round text-slate-400 mr-2">upload_file</span>
                        <span className="text-sm text-slate-500">Upload CV</span>
                      </label>
                    )}
                    <p className="text-xs text-slate-400">PDF, DOC, or DOCX (max 700KB)</p>
                  </div>
                ) : (
                  profile?.cvUrl ? (
                    <div className="flex items-center gap-2">
                      <span className="material-icons-round text-primary">description</span>
                      <span className="text-sm text-slate-600 dark:text-light-grey">CV uploaded</span>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No CV uploaded</p>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Account Section */}
        <section className="space-y-3">
          <h3 className="px-1 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">Account</h3>
          <Card className="bg-white dark:bg-card-bg border-slate-200 dark:border-card-border overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-card-border">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="material-icons-round text-blue-600 dark:text-blue-400">person</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-off-white">Display Name</p>
                  <p className="text-sm text-slate-500 dark:text-light-grey">{user.displayName || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-card-border">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <span className="material-icons-round text-purple-600 dark:text-purple-400">email</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-off-white">Email</p>
                  <p className="text-sm text-slate-500 dark:text-light-grey">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <span className="material-icons-round text-emerald-600 dark:text-emerald-400">verified</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-off-white">Account Status</p>
                  <p className="text-sm text-emerald-500">Verified</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Sign Out */}
        <section className="pt-4">
          <Button
            variant="destructive"
            onClick={onLogout}
            className="w-full py-4 h-auto bg-red-50 dark:bg-red-900/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 font-semibold rounded-xl"
          >
            <span className="material-icons-round text-xl">logout</span>
            Sign Out
          </Button>
        </section>
      </main>
    </motion.div>
  );
}
