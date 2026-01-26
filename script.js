// Job Application Tracker
class JobTracker {
    constructor() {
        this.jobs = this.loadJobs();
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.renderJobs();
        this.updateStats();
        this.attachEventListeners();
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

    saveJob() {
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
            this.jobs.push(job);
        }

        this.saveToLocalStorage();
        this.renderJobs();
        this.updateStats();
        this.closeModal();
    }

    deleteJob(id) {
        if (confirm('Are you sure you want to delete this job application?')) {
            this.jobs = this.jobs.filter(job => job.id !== id);
            this.saveToLocalStorage();
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
        const data = localStorage.getItem('jobTrackerData');
        return data ? JSON.parse(data) : [];
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new JobTracker();
});
