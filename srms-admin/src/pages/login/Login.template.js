export default `<main class="login-page">
  <section class="login-book" aria-label="SMS platform administrator sign in">
    <div class="book-page welcome-page">
      <div class="welcome-brand"><SMSBrand layout="horizontal" variant="light" label="SMS School Management System" /></div>
      <div class="welcome-copy">
        <h1>Empowering<br />Schools for a<br /><span>Brighter Tomorrow</span></h1>
        <p>A comprehensive platform to manage students, academics, examinations, fees, results and more — all in one place.</p>
      </div>
      <div class="login-features" aria-label="Platform features">
        <div><span class="feature-icon students-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20m7-9a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-7.5a4 4 0 0 1 0 7.7m4 8.8v-1.5a4 4 0 0 0-3-3.87"/></svg></span><strong>Student<br />Management</strong></div>
        <div><span class="feature-icon academics-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m2 8 10-5 10 5-10 5L2 8Zm4 3v5c3.7 3 8.3 3 12 0v-5m4-3v7"/></svg></span><strong>Academic<br />System</strong></div>
        <div><span class="feature-icon exams-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 3h8l5 5v13H7zM15 3v5h5M10 13h7m-7 4h7"/><path d="M3 7v14h13"/></svg></span><strong>Examinations<br />&amp; Results</strong></div>
        <div><span class="feature-icon reports-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20v-7h4v7m4 0V4h4v16m4 0V9h4v11"/></svg></span><strong>Reports<br />&amp; Analytics</strong></div>
      </div>
      <div class="welcome-wave" aria-hidden="true"><svg viewBox="0 0 1000 180" preserveAspectRatio="none"><path d="M0 78C180 155 303 149 482 103s294-56 518-9v86H0Z"/></svg></div>
      <div class="welcome-bottom">
        <span><svg viewBox="0 0 24 24"><path d="M3 5.5A6.5 6.5 0 0 1 9.5 4H12v16H9.5A6.5 6.5 0 0 0 3 21Zm18 0A6.5 6.5 0 0 0 14.5 4H12v16h2.5A6.5 6.5 0 0 1 21 21Z"/></svg>Better Learning</span>
        <span><svg viewBox="0 0 24 24"><path d="m12 3 8 3v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6Zm-3 9 2 2 4-5"/></svg>Stronger Schools</span>
        <span><svg viewBox="0 0 24 24"><path d="m3 17 6-6 4 3 7-8m-5 0h5v5M4 21h16"/></svg>Brighter Futures</span>
      </div>
    </div>
    <div class="book-page signin-page">
      <span class="signin-badge"><svg viewBox="0 0 24 24"><path d="m12 2 8 3v6c0 5-3.4 8.2-8 11-4.6-2.8-8-6-8-11V5Zm-3 10 2 2 4-5"/></svg>Admin Portal</span>
      <div class="signin-content">
        <SMSBrand class="signin-logo" layout="stacked" variant="dark" label="SMS School Management System" />
        <h2>Welcome back</h2>
        <p class="muted signin-subtitle">Sign in to manage your school network</p>
        <form @submit.prevent="submit">
          <label class="credential-field"><span class="credential-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg></span><span class="credential-input"><small>Username</small><input v-model="username" autocomplete="username" required /></span></label>
          <label class="credential-field"><span class="credential-icon"><svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3m-4 5v2"/></svg></span><span class="credential-input"><small>Password</small><input v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" required /></span><button type="button" class="password-toggle" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/><path v-if="!showPassword" d="m4 4 16 16"/></svg></button></label>
          <div class="login-options"><label class="remember-control"><input v-model="rememberMe" type="checkbox" />Remember me</label><button class="forgot-link" type="button" @click="showPasswordResetHelp">Forgot password?</button></div>
          <p v-if="error" class="alert error">{{ error }}</p>
          <button class="primary full signin-button" :disabled="saving"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17l5-5-5-5m5 5H3m10-9h5a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-5"/></svg><span>{{ saving ? 'Signing in…' : 'Sign in' }}</span></button>
        </form>
        <div class="signin-copyright"><span>© {{ new Date().getFullYear() }} School Management System. All rights reserved.</span></div>
      </div>
    </div>
  </section>
</main>`;
