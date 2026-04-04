import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { ChipSelector } from '../ui/chip-selector';
import { getSupportedPlatforms } from '../../services/scraping';
import { useScrapingSettings } from '../../hooks/useScrapingSettings';
import { useSuggestedJobs } from '../../hooks/useSuggestedJobs';
import { useProfile } from '../../hooks/useProfile';
import { useScrapingProgress } from '../../hooks/useScrapingProgress';
import { useScrapingPoller } from '../../hooks/useScrapingPoller';
import { startMission } from '../../hooks/useScrapingPoller';
import {
  JOB_ROLES,
  TECH_KEYWORDS,
  LOCATIONS,
  EXPERIENCE_LEVELS,
  JOB_TYPES,
  WORK_ARRANGEMENTS,
  POSTED_WITHIN,
} from '../../constants/scrapingOptions';
import type { User } from '../../types';

interface ScrapingSettingsPageProps {
  user: User | null;
  onBack: () => void;
}

export function ScrapingSettingsPage({ user, onBack }: ScrapingSettingsPageProps) {
  const {
    settings,
    loading: settingsLoading,
    error,
    updateSettings,
    saveApifyToken,
    getApifyToken,
    removeApifyToken,
    clearError,
  } = useScrapingSettings(user?.uid || null);

  const {
    profile,
    loading: profileLoading,
  } = useProfile(user?.uid || null, user?.email || null, user?.displayName || null);

  const {
    activeJobs,
    lastRefreshTime,
  } = useSuggestedJobs(user?.uid || null);

  const mission = useScrapingProgress();
  const { startPolling, stopScraping, isStopping: pollerStopping } = useScrapingPoller(user?.uid || null);

  const [apifyTokenInput, setApifyTokenInput] = useState('');
  const [tokenSaved, setTokenSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const platforms = getSupportedPlatforms();
  const supportedPlatformIds = new Set(platforms.map(platform => platform.id));

  useEffect(() => {
    if (user?.uid && !settingsLoading) {
      handleCheckToken();
    }
  }, [user?.uid, settingsLoading]);

  useEffect(() => {
    if (mission.status === 'running' && user?.uid) {
      startPolling();
    }
  }, [mission.status, user?.uid, startPolling]);

  const handleSaveApifyToken = async () => {
    if (!apifyTokenInput.trim()) {
      toast.error('Please enter an Apify token');
      return;
    }
    try {
      setIsSaving(true);
      await saveApifyToken(apifyTokenInput.trim());
      setTokenSaved(true);
      setApifyTokenInput('');
      toast.success('Apify token saved securely');
    } catch (err) {
      toast.error('Failed to save token');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCheckToken = async () => {
    const token = await getApifyToken();
    setTokenSaved(!!token);
  };

  const handleRemoveToken = async () => {
    try {
      setIsSaving(true);
      await removeApifyToken();
      setTokenSaved(false);
      toast.success('Apify token removed');
    } catch (err) {
      toast.error('Failed to remove token');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePlatform = async (platformId: string) => {
    if (isSaving) return;
    try {
      setIsSaving(true);
      const currentPlatforms = (settings?.platforms || []).filter(platform => supportedPlatformIds.has(platform));
      const newPlatforms = currentPlatforms.includes(platformId)
        ? currentPlatforms.filter(p => p !== platformId)
        : [...currentPlatforms, platformId];
      await updateSettings({ platforms: newPlatforms });
    } catch (err) {
      toast.error('Failed to update platforms');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefreshJobs = async () => {
    if (!tokenSaved || mission.status === 'running') {
      if (!tokenSaved) toast.error('Please save your Apify token first');
      return;
    }
    if (!settings) {
      toast.error('Settings not loaded yet, please wait a moment.');
      return;
    }
    try {
      const profileSkills = profile?.skills || [];
      const selectedRoles = settings.keywords || [];
      const selectedTech = settings.techKeywords || [];
      const selectedPlatforms = (settings.platforms || []).filter(
        platform => supportedPlatformIds.has(platform)
      );

      if (selectedPlatforms.length === 0) {
        toast.error('Select at least one platform before starting.');
        return;
      }

      const mergedKeywords = Array.from(
        new Set([...selectedRoles, ...selectedTech, ...profileSkills])
      );

      if (mergedKeywords.length === 0) {
        toast.error('Select at least one job role, tech skill, or add profile skills.');
        return;
      }

      const settingsForScraping = {
        ...settings,
        platforms: selectedPlatforms,
        keywords: mergedKeywords,
      };

      await startMission(user!.uid, settingsForScraping);
      startPolling();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start job discovery');
    }
  };

  const formatLastRefresh = (isoString: string | null) => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const loading = settingsLoading || profileLoading;

  if (loading && !settings) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-b-primary"></div>
      </div>
    );
  }

  return (
    <main className="max-w-md mx-auto px-5 pb-24 pt-4">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
            <span className="material-icons-round">arrow_back</span>
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-off-white">Scraping Settings</h1>
        </div>
      </header>

      {/* Apify Token Section */}
      <section className="mb-8">
        <h3 className="px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">Apify Integration</h3>
        <div className="bg-white dark:bg-card-bg rounded-xl p-4 shadow-sm border border-slate-200 dark:border-card-border">
          <p className="text-sm text-slate-600 dark:text-light-grey mb-3">
            Enter your Apify API token to enable job scraping. Get it from{' '}
            <a href="https://console.apify.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Apify Console</a>
          </p>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="Enter Apify token..."
              value={apifyTokenInput}
              onChange={(e) => setApifyTokenInput(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSaveApifyToken} size="sm">Save</Button>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={handleCheckToken}>
              Check Status
            </Button>
            {tokenSaved && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Token saved
              </span>
            )}
            {tokenSaved && (
              <Button variant="ghost" size="sm" onClick={handleRemoveToken} className="text-red-500 hover:text-red-600">
                Remove
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Platform Selection */}
      <section className="mb-8">
        <h3 className="px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">Target Platforms</h3>
        <div className="bg-white dark:bg-card-bg rounded-xl p-4 shadow-sm border border-slate-200 dark:border-card-border">
          <p className="text-sm text-slate-600 dark:text-light-grey mb-3">
            Select which platforms to scrape job listings from
          </p>
          <div className="flex flex-wrap gap-2">
            {platforms.map(platform => (
              <Badge
                key={platform.id}
                variant={settings?.platforms?.includes(platform.id) ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-1"
                onClick={() => togglePlatform(platform.id)}
              >
                {platform.name}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Progress (shown when scraping is running) */}
      {mission.status === 'running' && (
        <section className="mb-8">
          <h3 className="px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">Job Discovery Progress</h3>
          <div className="bg-white dark:bg-card-bg rounded-xl p-4 shadow-sm border border-primary/30">
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  <span className="text-sm font-medium text-slate-900 dark:text-off-white">Running...</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-bold text-primary">{Math.round(mission.progress)}%</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                    onClick={stopScraping}
                    disabled={pollerStopping}
                    title="Stop Discovery"
                  >
                    {pollerStopping ? (
                      <span className="material-icons-round text-lg animate-spin">autorenew</span>
                    ) : (
                      <span className="material-icons-round text-lg">stop_circle</span>
                    )}
                  </Button>
                </div>
              </div>
              <Progress value={mission.progress} className="h-2" />
              <p className="text-xs text-slate-500 mt-2">{mission.currentStep}</p>
            </div>

            {/* Step-by-step status */}
            {mission.steps.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Steps</p>
                {mission.steps.map(step => (
                  <div key={step.id} className="flex items-center gap-2 text-sm">
                    {step.status === 'pending' && (
                      <span className="material-icons-round text-slate-300 text-lg">radio_button_unchecked</span>
                    )}
                    {step.status === 'running' && (
                      <span className="material-icons-round text-primary animate-spin text-lg">autorenew</span>
                    )}
                    {step.status === 'completed' && (
                      <span className="material-icons-round text-green-500 text-lg">check_circle</span>
                    )}
                    {step.status === 'failed' && (
                      <span className="material-icons-round text-red-500 text-lg">error</span>
                    )}
                    <span className={`flex-1 ${
                      step.status === 'running' ? 'text-primary font-medium' :
                      step.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                      step.status === 'failed' ? 'text-red-500' :
                      'text-slate-400'
                    }`}>
                      {step.label}
                    </span>
                    {step.status === 'completed' && step.jobsFound > 0 && (
                      <Badge variant="default" className="text-xs px-2 py-0.5">
                        {step.jobsFound} jobs
                      </Badge>
                    )}
                    {step.status === 'completed' && step.jobsFound === 0 && (
                      <span className="text-xs text-slate-400">0 jobs</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Errors */}
            {mission.steps.some(s => s.status === 'failed') && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">Errors</p>
                {mission.steps.filter(s => s.status === 'failed').map(step => (
                  <p key={step.id} className="text-xs text-red-500">
                    {step.label}: {step.error || 'Unknown error'}
                  </p>
                ))}
              </div>
            )}

            <p className="text-[10px] text-slate-400 mt-3 italic">
              Keep this tab open while scraping runs in the background.
            </p>
          </div>
        </section>
      )}

      {/* Mission completed/failed summary */}
      {(mission.status === 'completed' || mission.status === 'failed') && (
        <section className="mb-8">
          <h3 className="px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">Last Mission</h3>
          <div className={`bg-white dark:bg-card-bg rounded-xl p-4 shadow-sm border ${
            mission.status === 'completed' ? 'border-green-500/30' : 'border-red-500/30'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-icons-round text-lg ${
                mission.status === 'completed' ? 'text-green-500' : 'text-red-500'
              }`}>
                {mission.status === 'completed' ? 'check_circle' : 'error'}
              </span>
              <span className="text-sm font-medium text-slate-900 dark:text-off-white">
                {mission.currentStep}
              </span>
            </div>
            {mission.finishedAt && (
              <p className="text-xs text-slate-400">
                Finished: {new Date(mission.finishedAt).toLocaleString()}
              </p>
            )}
            {mission.steps.length > 0 && (
              <div className="mt-3 space-y-1">
                {mission.steps.map(step => (
                  <div key={step.id} className="flex items-center gap-2 text-xs">
                    {step.status === 'completed' && (
                      <span className="material-icons-round text-green-500 text-sm">check_circle</span>
                    )}
                    {step.status === 'failed' && (
                      <span className="material-icons-round text-red-500 text-sm">error</span>
                    )}
                    <span className="flex-1 text-slate-600 dark:text-light-grey">{step.label}</span>
                    {step.jobsFound > 0 && (
                      <span className="text-primary font-medium">{step.jobsFound} jobs</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => mission.clearMission()}
            >
              Clear
            </Button>
          </div>
        </section>
      )}

      {/* Job Roles */}
      <section className="mb-8">
        <h3 className="px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">
          Job Roles
        </h3>
        <div className="bg-white dark:bg-card-bg rounded-xl p-4 shadow-sm border border-slate-200 dark:border-card-border">
          <p className="text-sm text-slate-600 dark:text-light-grey mb-3">
            Select the job roles you're looking for
          </p>
          <ChipSelector
            options={JOB_ROLES}
            selected={settings?.keywords || []}
            onChange={async (selected) => {
              try {
                setIsSaving(true);
                await updateSettings({ keywords: selected });
              } catch {
                toast.error('Failed to update roles');
              } finally {
                setIsSaving(false);
              }
            }}
            searchable
            grouped
            maxVisible={15}
            disabled={isSaving || mission.status === 'running'}
          />
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mb-8">
        <h3 className="px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">
          Tech Stack
        </h3>
        <div className="bg-white dark:bg-card-bg rounded-xl p-4 shadow-sm border border-slate-200 dark:border-card-border">
          <p className="text-sm text-slate-600 dark:text-light-grey mb-3">
            Select technologies and skills to filter by
          </p>
          <ChipSelector
            options={TECH_KEYWORDS}
            selected={settings?.techKeywords || []}
            onChange={async (selected) => {
              try {
                setIsSaving(true);
                await updateSettings({ techKeywords: selected });
              } catch {
                toast.error('Failed to update tech stack');
              } finally {
                setIsSaving(false);
              }
            }}
            searchable
            grouped
            maxVisible={15}
            disabled={isSaving || mission.status === 'running'}
          />
        </div>
      </section>

      {/* Locations */}
      <section className="mb-8">
        <h3 className="px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">
          Search Locations
        </h3>
        <div className="bg-white dark:bg-card-bg rounded-xl p-4 shadow-sm border border-slate-200 dark:border-card-border">
          <p className="text-sm text-slate-600 dark:text-light-grey mb-3">
            Select target locations for job search
          </p>
          <ChipSelector
            options={LOCATIONS}
            selected={settings?.locations || []}
            onChange={async (selected) => {
              try {
                setIsSaving(true);
                await updateSettings({ locations: selected });
              } catch {
                toast.error('Failed to update locations');
              } finally {
                setIsSaving(false);
              }
            }}
            searchable
            grouped
            maxVisible={10}
            disabled={isSaving || mission.status === 'running'}
          />
        </div>
      </section>

      {/* Experience Level */}
      <section className="mb-8">
        <h3 className="px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">
          Experience Level
        </h3>
        <div className="bg-white dark:bg-card-bg rounded-xl p-4 shadow-sm border border-slate-200 dark:border-card-border">
          <p className="text-sm text-slate-600 dark:text-light-grey mb-3">
            Filter by experience level
          </p>
          <ChipSelector
            options={EXPERIENCE_LEVELS}
            selected={settings?.experienceLevels || []}
            onChange={async (selected) => {
              try {
                setIsSaving(true);
                await updateSettings({ experienceLevels: selected });
              } catch {
                toast.error('Failed to update experience levels');
              } finally {
                setIsSaving(false);
              }
            }}
            disabled={isSaving || mission.status === 'running'}
          />
        </div>
      </section>

      {/* Job Type */}
      <section className="mb-8">
        <h3 className="px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">
          Job Type
        </h3>
        <div className="bg-white dark:bg-card-bg rounded-xl p-4 shadow-sm border border-slate-200 dark:border-card-border">
          <ChipSelector
            options={JOB_TYPES}
            selected={settings?.jobTypes || []}
            onChange={async (selected) => {
              try {
                setIsSaving(true);
                await updateSettings({ jobTypes: selected });
              } catch {
                toast.error('Failed to update job types');
              } finally {
                setIsSaving(false);
              }
            }}
            disabled={isSaving || mission.status === 'running'}
          />
        </div>
      </section>

      {/* Work Arrangement */}
      <section className="mb-8">
        <h3 className="px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">
          Work Arrangement
        </h3>
        <div className="bg-white dark:bg-card-bg rounded-xl p-4 shadow-sm border border-slate-200 dark:border-card-border">
          <ChipSelector
            options={WORK_ARRANGEMENTS}
            selected={settings?.workArrangements || []}
            onChange={async (selected) => {
              try {
                setIsSaving(true);
                await updateSettings({ workArrangements: selected });
              } catch {
                toast.error('Failed to update work arrangement');
              } finally {
                setIsSaving(false);
              }
            }}
            disabled={isSaving || mission.status === 'running'}
          />
        </div>
      </section>

      {/* Posted Within */}
      <section className="mb-8">
        <h3 className="px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">
          Posted Within
        </h3>
        <div className="bg-white dark:bg-card-bg rounded-xl p-4 shadow-sm border border-slate-200 dark:border-card-border">
          <ChipSelector
            options={POSTED_WITHIN}
            selected={settings?.postedWithin ? [settings.postedWithin] : ['any']}
            onChange={async (selected) => {
              try {
                setIsSaving(true);
                await updateSettings({ postedWithin: selected[0] || 'any' });
              } catch {
                toast.error('Failed to update time filter');
              } finally {
                setIsSaving(false);
              }
            }}
            singleSelect
            disabled={isSaving || mission.status === 'running'}
          />
        </div>
      </section>

      {/* Refresh Jobs */}
      <section className="mb-8">
        <h3 className="px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">Job Discovery</h3>
        <div className="bg-white dark:bg-card-bg rounded-xl p-4 shadow-sm border border-slate-200 dark:border-card-border">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-medium text-slate-900 dark:text-off-white">Suggested Jobs</p>
              <p className="text-xs text-slate-500">
                Last refresh: {formatLastRefresh(lastRefreshTime)}
              </p>
            </div>
            <span className="text-lg font-bold text-primary">{activeJobs.length}</span>
          </div>
          <Button 
            onClick={handleRefreshJobs} 
            disabled={mission.status === 'running' || !tokenSaved || pollerStopping}
            className="w-full"
          >
            {!tokenSaved ? (
              <>
                <span className="material-icons-round mr-2 text-sm">lock</span>
                Save Apify Token First
              </>
            ) : pollerStopping ? (
              <>
                <span className="material-icons-round mr-2 animate-spin text-sm">autorenew</span>
                Stopping...
              </>
            ) : mission.status === 'running' ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Scraping in Progress...
              </>
            ) : (
              <>
                <span className="material-icons-round mr-2">search</span>
                Start Job Discovery
              </>
            )}
          </Button>
          {!tokenSaved && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 text-center">
              Please save your Apify token above to enable job discovery
            </p>
          )}
          {mission.status === 'running' && (
            <p className="text-xs text-primary mt-2 text-center">
              Scraping is running in the background. You can navigate away.
            </p>
          )}
        </div>
      </section>

      {/* Login Sessions (for authenticated scraping) */}
      <section className="mb-8">
        <h3 className="px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">Platform Login</h3>
        <div className="bg-white dark:bg-card-bg rounded-xl p-4 shadow-sm border border-slate-200 dark:border-card-border">
          <p className="text-sm text-slate-600 dark:text-light-grey mb-3">
            For better results on Naukri/Naukri Gulf, you can add login sessions via Apify.
          </p>
          <p className="text-xs text-slate-400 italic">
            * Login session management is handled securely through your Apify account.
          </p>
        </div>
      </section>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">
          {error}
          <button onClick={clearError} className="ml-2 underline font-medium">Dismiss</button>
        </div>
      )}
    </main>
  );
}
