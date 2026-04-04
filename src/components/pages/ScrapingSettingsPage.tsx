import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { getSupportedPlatforms } from '../../services/scraping';
import { useScrapingSettings } from '../../hooks/useScrapingSettings';
import { useSuggestedJobs } from '../../hooks/useSuggestedJobs';
import { useProfile } from '../../hooks/useProfile';
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
    refreshing,
    refreshJobs,
    activeJobs,
    lastRefreshTime,
  } = useSuggestedJobs(user?.uid || null);

  const [apifyTokenInput, setApifyTokenInput] = useState('');
  const [tokenSaved, setTokenSaved] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const platforms = getSupportedPlatforms();
  const supportedPlatformIds = new Set(platforms.map(platform => platform.id));

  useEffect(() => {
    if (user?.uid && !settingsLoading) {
      handleCheckToken();
    }
  }, [user?.uid, settingsLoading]);

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

  const addKeyword = async () => {
    if (!keywordInput.trim() || isSaving) return;
    const trimmed = keywordInput.trim();
    if (settings?.keywords?.includes(trimmed)) {
      toast.error('Keyword already exists');
      return;
    }
    try {
      setIsSaving(true);
      const newKeywords = [...(settings?.keywords || []), trimmed];
      await updateSettings({ keywords: newKeywords });
      setKeywordInput('');
      toast.success('Keyword added');
    } catch (err) {
      toast.error('Failed to add keyword');
    } finally {
      setIsSaving(false);
    }
  };

  const removeKeyword = async (keyword: string) => {
    if (isSaving) return;
    try {
      setIsSaving(true);
      const newKeywords = (settings?.keywords || []).filter(k => k !== keyword);
      await updateSettings({ keywords: newKeywords });
      toast.success('Keyword removed');
    } catch (err) {
      toast.error('Failed to remove keyword');
    } finally {
      setIsSaving(false);
    }
  };

  const addLocation = async () => {
    if (!locationInput.trim() || isSaving) return;
    const trimmed = locationInput.trim();
    if (settings?.locations?.includes(trimmed)) {
      toast.error('Location already exists');
      return;
    }
    try {
      setIsSaving(true);
      const newLocations = [...(settings?.locations || []), trimmed];
      await updateSettings({ locations: newLocations });
      setLocationInput('');
      toast.success('Location added');
    } catch (err) {
      toast.error('Failed to add location');
    } finally {
      setIsSaving(false);
    }
  };

  const removeLocation = async (loc: string) => {
    if (isSaving) return;
    try {
      setIsSaving(true);
      const newLocations = (settings?.locations || []).filter(l => l !== loc);
      await updateSettings({ locations: newLocations });
      toast.success('Location removed');
    } catch (err) {
      toast.error('Failed to remove location');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefreshJobs = async () => {
    if (!tokenSaved || refreshing) {
      if (!tokenSaved) toast.error('Please save your Apify token first');
      return;
    }
    if (!settings) {
      toast.error('Settings not loaded yet, please wait a moment.');
      return;
    }
    try {
      // Merge profile skills into scraping keywords so user skills power the search
      const profileSkills = profile?.skills || [];
      const manualKeywords = settings.keywords || [];
      const mergedKeywords = Array.from(new Set([...manualKeywords, ...profileSkills]));
      const selectedPlatforms = (settings.platforms || []).filter(platform => supportedPlatformIds.has(platform));

      if (selectedPlatforms.length === 0) {
        toast.error('Select at least one supported platform before starting job discovery.');
        return;
      }

      if (mergedKeywords.length === 0) {
        toast.error('Add at least one keyword or profile skill before starting job discovery.');
        return;
      }

      const settingsWithMergedKeywords = {
        ...settings,
        platforms: selectedPlatforms,
        keywords: mergedKeywords,
      };
      await refreshJobs(settingsWithMergedKeywords);
      toast.success(`Search completed! Check Suggested Jobs.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to refresh jobs');
    }
  };

  const handleToggleRemote = async () => {
    if (isSaving) return;
    try {
      setIsSaving(true);
      await updateSettings({ remoteOnly: !(settings?.remoteOnly ?? false) });
    } catch (err) {
      toast.error('Failed to toggle remote filter');
    } finally {
      setIsSaving(false);
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

      {/* Keywords */}
      <section className="mb-8">
        <h3 className="px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">Search Keywords</h3>
        <div className="bg-white dark:bg-card-bg rounded-xl p-4 shadow-sm border border-slate-200 dark:border-card-border">
          <p className="text-sm text-slate-600 dark:text-light-grey mb-3">
            Add custom keywords to search for jobs.
          </p>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="e.g., React, Python, Remote..."
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
            />
            <Button onClick={addKeyword} size="sm">Add</Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Manual Keywords</p>
              <div className="flex flex-wrap gap-2">
                {settings?.keywords?.map(keyword => (
                  <Badge key={keyword} variant="secondary" className="pr-1 py-1">
                    {keyword}
                    <button onClick={() => removeKeyword(keyword)} className="ml-1 hover:text-red-500 flex items-center">
                      <span className="material-icons-round text-sm">close</span>
                    </button>
                  </Badge>
                ))}
                {(!settings?.keywords || settings.keywords.length === 0) && (
                  <span className="text-xs text-slate-400 italic">No custom keywords yet</span>
                )}
              </div>
            </div>

            {profile?.skills && profile.skills.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">From Your Profile</p>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map(skill => (
                    <Badge key={skill} variant="outline" className="opacity-70 bg-slate-50 dark:bg-slate-800/30">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic">
                  * These skills are automatically included in search
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="mb-8">
        <h3 className="px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">Search Locations</h3>
        <div className="bg-white dark:bg-card-bg rounded-xl p-4 shadow-sm border border-slate-200 dark:border-card-border">
          <p className="text-sm text-slate-600 dark:text-light-grey mb-3">
            Add target cities or regions for job search.
          </p>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="e.g., Remote, New York, London..."
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addLocation()}
            />
            <Button onClick={addLocation} size="sm">Add</Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {settings?.locations?.map(loc => (
              <Badge key={loc} variant="outline" className="pr-1 py-1 border-primary/20 bg-primary/5">
                <span className="flex items-center gap-1">
                  <span className="material-icons-round text-xs text-primary">location_on</span>
                  {loc}
                </span>
                <button onClick={() => removeLocation(loc)} className="ml-1 hover:text-red-500 flex items-center">
                  <span className="material-icons-round text-sm">close</span>
                </button>
              </Badge>
            ))}
            {(!settings?.locations || settings.locations.length === 0) && (
              <span className="text-xs text-slate-400 italic">No locations added (will search globally)</span>
            )}
          </div>
        </div>
      </section>

      {/* Remote Only Toggle */}
      <section className="mb-8">
        <h3 className="px-1 mb-2 text-xs font-semibold text-slate-400 dark:text-light-grey uppercase tracking-wider">Filters</h3>
        <div className="bg-white dark:bg-card-bg rounded-xl shadow-sm border border-slate-200 dark:border-card-border overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-icons-round text-lg">home_work</span>
              </div>
              <span className="font-medium text-slate-900 dark:text-off-white">Remote Only</span>
            </div>
            <label className="relative inline-block w-11 h-6 cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={settings?.remoteOnly || false}
                onChange={handleToggleRemote}
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-card-border peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
            </label>
          </div>
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
            disabled={refreshing || !tokenSaved}
            className="w-full"
          >
            {!tokenSaved ? (
              <>
                <span className="material-icons-round mr-2 text-sm">lock</span>
                Save Apify Token First
              </>
            ) : refreshing ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Searching Platforms...
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
