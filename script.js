// Job Application Tracker
class JobTracker {
    constructor() {
        this.jobs = [];
        this.currentEditId = null;
        this.currentUser = null;
        this.isSignedIn = false;
        this.isSignUpMode = false;
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.initFirebaseAuth();
        // Jobs will be loaded after auth state is determined
    }

    attachEventListeners() {
        // Modal controls
        document.getElementById('addJobBtn').addEventListener('click', () => this.openModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        
        // Click outside modal to close
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('jobModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Form submission
        document.getElementById('jobForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveJob();
        });

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => this.exportToXML());
        
        // Auth buttons
        document.getElementById('loginBtn').addEventListener('click', () => this.openAuthModal());
        document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());
        document.getElementById('authModalClose').addEventListener('click', () => this.closeAuthModal());
        
        // Auth tabs
        document.getElementById('signInTab').addEventListener('click', () => this.switchAuthTab(false));
        document.getElementById('signUpTab').addEventListener('click', () => this.switchAuthTab(true));
        
        // Auth form
        document.getElementById('authForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAuth();
        });
        
        // Google Sign In
        document.getElementById('googleSignInBtn').addEventListener('click', () => this.handleGoogleSignIn());
        
        // Import button
        document.getElementById('importBtn').addEventListener('click', () => this.openImportDialog());
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileImport(e));

        // Search and filters
        document.getElementById('searchInput').addEventListener('input', () => this.filterJobs());
        document.getElementById('statusFilter').addEventListener('change', () => this.filterJobs());
        document.getElementById('platformFilter').addEventListener('change', () => this.filterJobs());
    }

    openModal(job = null) {
        const modal = document.getElementById('jobModal');
        const form = document.getElementById('jobForm');
        const title = document.getElementById('modalTitle');

        if (job) {
            title.textContent = 'Edit Job Application';
            this.currentEditId = job.id;
            this.fillForm(job);
        } else {
            title.textContent = 'Add Job Application';
            this.currentEditId = null;
            form.reset();
        }

        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('jobModal').style.display = 'none';
        document.getElementById('jobForm').reset();
        this.currentEditId = null;
    }

    fillForm(job) {
        document.getElementById('companyName').value = job.companyName || '';
        document.getElementById('position').value = job.position || '';
        document.getElementById('website').value = job.website || '';
        document.getElementById('jobListing').value = job.jobListing || '';
        document.getElementById('salary').value = job.salary || '';
        document.getElementById('location').value = job.location || '';
        document.getElementById('email').value = job.email || '';
        document.getElementById('phone').value = job.phone || '';
        document.getElementById('jobPostDate').value = job.jobPostDate || '';
        document.getElementById('appliedDate').value = job.appliedDate || '';
        document.getElementById('platform').value = job.platform || '';
        document.getElementById('status').value = job.status || '';
        document.getElementById('notes').value = job.notes || '';
    }

    async saveJob() {
        if (!this.isSignedIn) {
            alert('Please sign in to save your data.');
            this.openAuthModal();
            return;
        }

        const job = {
            id: this.currentEditId || Date.now().toString(),
            companyName: document.getElementById('companyName').value,
            position: document.getElementById('position').value,
            website: document.getElementById('website').value,
            jobListing: document.getElementById('jobListing').value,
            salary: document.getElementById('salary').value,
            location: document.getElementById('location').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            jobPostDate: document.getElementById('jobPostDate').value,
            appliedDate: document.getElementById('appliedDate').value,
            platform: document.getElementById('platform').value,
            status: document.getElementById('status').value,
            notes: document.getElementById('notes').value,
            createdAt: this.currentEditId ? this.jobs.find(j => j.id === this.currentEditId).createdAt : new Date().toISOString()
        };

        if (this.currentEditId) {
            const index = this.jobs.findIndex(j => j.id === this.currentEditId);
            this.jobs[index] = job;
        } else {
            this.jobs.unshift(job); // Add to beginning
        }

        await this.saveToFirestore(job);
        this.renderJobs();
        this.updateStats();
        this.closeModal();
    }

    async deleteJob(id) {
        if (confirm('Are you sure you want to delete this job application?')) {
            this.jobs = this.jobs.filter(job => job.id !== id);
            await this.deleteFromFirestore(id);
            this.renderJobs();
            this.updateStats();
        }
    }

    filterJobs() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;
        const platformFilter = document.getElementById('platformFilter').value;

        let filtered = this.jobs;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(job => 
                job.companyName.toLowerCase().includes(searchTerm) ||
                job.position.toLowerCase().includes(searchTerm) ||
                job.platform.toLowerCase().includes(searchTerm) ||
                (job.location && job.location.toLowerCase().includes(searchTerm))
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(job => job.status === statusFilter);
        }

        // Platform filter
        if (platformFilter !== 'all') {
            filtered = filtered.filter(job => job.platform === platformFilter);
        }

        this.renderJobs(filtered);
    }

    renderJobs(jobsToRender = this.jobs) {
        const jobsList = document.getElementById('jobsList');

        if (jobsToRender.length === 0) {
            jobsList.innerHTML = `
                <div class="empty-state">
                    <h2>No Job Applications Yet</h2>
                    <p>Click "Add Job Application" to start tracking your job search!</p>
                </div>
            `;
            return;
        }

        jobsList.innerHTML = jobsToRender.map(job => this.createJobCard(job)).join('');

        // Attach event listeners to action buttons
        jobsToRender.forEach(job => {
            document.getElementById(`edit-${job.id}`).addEventListener('click', () => this.openModal(job));
            document.getElementById(`delete-${job.id}`).addEventListener('click', () => this.deleteJob(job.id));
        });
    }

    createJobCard(job) {
        const statusClass = `status-${job.status}`;
        const appliedDate = job.appliedDate ? new Date(job.appliedDate).toLocaleDateString() : 'Not specified';
        const jobPostDate = job.jobPostDate ? new Date(job.jobPostDate).toLocaleDateString() : 'Not specified';

        return `
            <div class="job-card">
                <div class="job-card-header">
                    <div class="job-card-title">
                        <h3>${job.companyName}</h3>
                        <p class="position">${job.position}</p>
                    </div>
                    <span class="status-badge ${statusClass}">${job.status}</span>
                </div>
                
                <span class="platform-badge">📍 ${job.platform}</span>
                
                <div class="job-details">
                    ${job.location ? `<div class="job-detail-item"><span>📍</span> ${job.location}</div>` : ''}
                    ${job.salary ? `<div class="job-detail-item"><span>💰</span> ${job.salary}</div>` : ''}
                    ${job.website ? `<div class="job-detail-item"><span>🌐</span> <a href="${job.website}" target="_blank">Company Website</a></div>` : ''}
                    ${job.jobListing ? `<div class="job-detail-item"><span>🔗</span> <a href="${job.jobListing}" target="_blank">Job Listing</a></div>` : ''}
                    ${job.email ? `<div class="job-detail-item"><span>📧</span> <a href="mailto:${job.email}">${job.email}</a></div>` : ''}
                    ${job.phone ? `<div class="job-detail-item"><span>📞</span> ${job.phone}</div>` : ''}
                    <div class="job-detail-item"><span>📅</span> Posted: ${jobPostDate}</div>
                    <div class="job-detail-item"><span>✅</span> Applied: ${appliedDate}</div>
                    ${job.notes ? `<div class="job-detail-item"><span>📝</span> ${job.notes}</div>` : ''}
                </div>
                
                <div class="job-actions">
                    <button id="edit-${job.id}" class="btn btn-edit">Edit</button>
                    <button id="delete-${job.id}" class="btn btn-danger">Delete</button>
                </div>
            </div>
        `;
    }

    updateStats() {
        const total = this.jobs.length;
        const pending = this.jobs.filter(j => j.status === 'pending').length;
        const callback = this.jobs.filter(j => j.status === 'callback').length;
        const rejected = this.jobs.filter(j => j.status === 'rejected').length;

        document.getElementById('totalApplied').textContent = total;
        document.getElementById('totalPending').textContent = pending;
        document.getElementById('totalCallback').textContent = callback;
        document.getElementById('totalRejected').textContent = rejected;
    }

    exportToXML() {
        if (this.jobs.length === 0) {
            alert('No job applications to export!');
            return;
        }

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<JobApplications>\n';

        this.jobs.forEach(job => {
            xml += '  <Job>\n';
            xml += `    <ID>${this.escapeXML(job.id)}</ID>\n`;
            xml += `    <CompanyName>${this.escapeXML(job.companyName)}</CompanyName>\n`;
            xml += `    <Position>${this.escapeXML(job.position)}</Position>\n`;
            xml += `    <Website>${this.escapeXML(job.website)}</Website>\n`;
            xml += `    <JobListing>${this.escapeXML(job.jobListing)}</JobListing>\n`;
            xml += `    <Salary>${this.escapeXML(job.salary)}</Salary>\n`;
            xml += `    <Location>${this.escapeXML(job.location)}</Location>\n`;
            xml += `    <Email>${this.escapeXML(job.email)}</Email>\n`;
            xml += `    <Phone>${this.escapeXML(job.phone)}</Phone>\n`;
            xml += `    <JobPostDate>${this.escapeXML(job.jobPostDate)}</JobPostDate>\n`;
            xml += `    <AppliedDate>${this.escapeXML(job.appliedDate)}</AppliedDate>\n`;
            xml += `    <Platform>${this.escapeXML(job.platform)}</Platform>\n`;
            xml += `    <Status>${this.escapeXML(job.status)}</Status>\n`;
            xml += `    <Notes>${this.escapeXML(job.notes)}</Notes>\n`;
            xml += `    <CreatedAt>${this.escapeXML(job.createdAt)}</CreatedAt>\n`;
            xml += '  </Job>\n';
        });

        xml += '</JobApplications>';

        this.downloadFile(xml, 'job-applications.xml', 'application/xml');
    }

    escapeXML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    saveToLocalStorage() {
        localStorage.setItem('jobTrackerData', JSON.stringify(this.jobs));
    }

    loadJobs() {
        // Deprecated - now using Firestore
        const data = localStorage.getItem('jobTrackerData');
        return data ? JSON.parse(data) : [];
    }

    // Firebase Authentication Methods
    initFirebaseAuth() {
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.isSignedIn = true;
                this.updateAuthUI();
                this.loadJobsFromFirestore();
            } else {
                this.currentUser = null;
                this.isSignedIn = false;
                this.updateAuthUI();
                // Show empty state or load from localStorage as fallback
                this.jobs = [];
                this.renderJobs();
                this.updateStats();
            }
        });
    }

    openAuthModal() {
        document.getElementById('authModal').style.display = 'block';
        this.switchAuthTab(false); // Default to sign in
    }

    closeAuthModal() {
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('authForm').reset();
        this.hideAuthError();
    }

    switchAuthTab(isSignUp) {
        this.isSignUpMode = isSignUp;
        const signInTab = document.getElementById('signInTab');
        const signUpTab = document.getElementById('signUpTab');
        const modalTitle = document.getElementById('authModalTitle');
        const submitBtn = document.getElementById('authSubmitBtn');

        if (isSignUp) {
            signInTab.classList.remove('active');
            signUpTab.classList.add('active');
            modalTitle.textContent = 'Sign Up';
            submitBtn.textContent = 'Sign Up';
        } else {
            signInTab.classList.add('active');
            signUpTab.classList.remove('active');
            modalTitle.textContent = 'Sign In';
            submitBtn.textContent = 'Sign In';
        }
        this.hideAuthError();
    }

    async handleAuth() {
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;

        try {
            if (this.isSignUpMode) {
                await auth.createUserWithEmailAndPassword(email, password);
                alert('Account created successfully! Welcome!');
            } else {
                await auth.signInWithEmailAndPassword(email, password);
            }
            this.closeAuthModal();
        } catch (error) {
            this.showAuthError(this.getAuthErrorMessage(error.code));
        }
    }

    async handleGoogleSignIn() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account'
            });
            const result = await auth.signInWithPopup(provider);
            console.log('Google Sign-In successful:', result.user.email);
            this.closeAuthModal();
        } catch (error) {
            console.error('Google Sign-In error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            
            // Handle specific errors
            if (error.code === 'auth/popup-closed-by-user') {
                // User closed popup, no error message needed
                return;
            } else if (error.code === 'auth/popup-blocked') {
                this.showAuthError('Popup was blocked by your browser. Please allow popups for this site.');
            } else if (error.code === 'auth/unauthorized-domain' || error.code === 'auth/operation-not-allowed') {
                this.showAuthError('Google Sign-In is not properly configured. Please check Firebase Console setup.');
            } else if (error.code === 'auth/cancelled-popup-request') {
                // Multiple popup requests, ignore
                return;
            } else {
                this.showAuthError(`Google Sign-In failed: ${error.message}`);
            }
        }
    }

    async handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            try {
                await auth.signOut();
                this.jobs = [];
                this.renderJobs();
                this.updateStats();
            } catch (error) {
                console.error('Logout error:', error);
                alert('Failed to logout. Please try again.');
            }
        }
    }

    updateAuthUI() {
        const loginBtn = document.getElementById('loginBtn');
        const userInfo = document.getElementById('userInfo');
        const userEmail = document.getElementById('userEmail');

        if (this.isSignedIn && this.currentUser) {
            loginBtn.style.display = 'none';
            userInfo.style.display = 'flex';
            userEmail.textContent = this.currentUser.email;
        } else {
            loginBtn.style.display = 'inline-block';
            userInfo.style.display = 'none';
        }
    }

    showAuthError(message) {
        const errorDiv = document.getElementById('authError');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    hideAuthError() {
        const errorDiv = document.getElementById('authError');
        errorDiv.style.display = 'none';
    }

    getAuthErrorMessage(errorCode) {
        const errorMessages = {
            'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
            'auth/invalid-email': 'Invalid email address.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/user-not-found': 'No account found with this email.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.'
        };
        return errorMessages[errorCode] || 'Authentication failed. Please try again.';
    }

    // Firestore Methods
    async loadJobsFromFirestore() {
        if (!this.currentUser) return;

        try {
            const snapshot = await db.collection('users')
                .doc(this.currentUser.uid)
                .collection('jobs')
                .orderBy('createdAt', 'desc')
                .get();

            this.jobs = [];
            snapshot.forEach((doc) => {
                this.jobs.push({ id: doc.id, ...doc.data() });
            });

            this.renderJobs();
            this.updateStats();
        } catch (error) {
            console.error('Error loading jobs:', error);
            alert('Failed to load your data. Please refresh the page.');
        }
    }

    async saveToFirestore(job) {
        if (!this.currentUser) {
            alert('Please sign in to save your data.');
            return;
        }

        try {
            const jobRef = db.collection('users')
                .doc(this.currentUser.uid)
                .collection('jobs')
                .doc(job.id);

            await jobRef.set(job);
        } catch (error) {
            console.error('Error saving job:', error);
            alert('Failed to save data. Please try again.');
        }
    }

    async deleteFromFirestore(jobId) {
        if (!this.currentUser) return;

        try {
            await db.collection('users')
                .doc(this.currentUser.uid)
                .collection('jobs')
                .doc(jobId)
                .delete();
        } catch (error) {
            console.error('Error deleting job:', error);
            alert('Failed to delete. Please try again.');
        }
    }

    // Import/Export Methods
    openImportDialog() {
        if (!this.isSignedIn) {
            alert('Please sign in first to import data.');
            this.openAuthModal();
            return;
        }
        document.getElementById('fileInput').click();
    }

    async handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.xml')) {
            alert('Please select a valid XML file.');
            return;
        }

        try {
            const text = await file.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, 'text/xml');

            // Check for parsing errors
            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError) {
                throw new Error('Invalid XML file format.');
            }

            const jobs = xmlDoc.querySelectorAll('Job');
            if (jobs.length === 0) {
                alert('No job applications found in the XML file.');
                return;
            }

            let importedCount = 0;
            let skippedCount = 0;

            for (const jobNode of jobs) {
                const job = {
                    id: this.getXMLNodeValue(jobNode, 'ID') || Date.now().toString() + Math.random(),
                    companyName: this.getXMLNodeValue(jobNode, 'CompanyName'),
                    position: this.getXMLNodeValue(jobNode, 'Position'),
                    website: this.getXMLNodeValue(jobNode, 'Website'),
                    jobListing: this.getXMLNodeValue(jobNode, 'JobListing'),
                    salary: this.getXMLNodeValue(jobNode, 'Salary'),
                    location: this.getXMLNodeValue(jobNode, 'Location'),
                    email: this.getXMLNodeValue(jobNode, 'Email'),
                    phone: this.getXMLNodeValue(jobNode, 'Phone'),
                    jobPostDate: this.getXMLNodeValue(jobNode, 'JobPostDate'),
                    appliedDate: this.getXMLNodeValue(jobNode, 'AppliedDate'),
                    platform: this.getXMLNodeValue(jobNode, 'Platform'),
                    status: this.getXMLNodeValue(jobNode, 'Status'),
                    notes: this.getXMLNodeValue(jobNode, 'Notes'),
                    createdAt: this.getXMLNodeValue(jobNode, 'CreatedAt') || new Date().toISOString()
                };

                // Check if job already exists
                const exists = this.jobs.some(j => j.id === job.id);
                if (exists) {
                    skippedCount++;
                    continue;
                }

                // Add to local array and save to Firestore
                this.jobs.unshift(job);
                await this.saveToFirestore(job);
                importedCount++;
            }

            // Clear file input
            event.target.value = '';

            // Show results
            this.renderJobs();
            this.updateStats();

            let message = `Import complete!\n\n`;
            message += `✅ Imported: ${importedCount} job(s)\n`;
            if (skippedCount > 0) {
                message += `⏭️ Skipped (already exists): ${skippedCount} job(s)`;
            }
            alert(message);

        } catch (error) {
            console.error('Import error:', error);
            alert('Failed to import XML file. Please make sure it\'s a valid job tracker export file.');
        }
    }

    getXMLNodeValue(parentNode, tagName) {
        const node = parentNode.querySelector(tagName);
        return node ? node.textContent : '';
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new JobTracker();
});
