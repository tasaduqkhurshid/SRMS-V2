export default `
<div class="school-login-page">
  <section class="welcome-hero" aria-label="School welcome">
    <div class="welcome-cover" aria-hidden="true">
      <img :src="heroImageUrl" alt="" @error="handleHeroImageError" />
    </div>
    <div class="welcome-shade" aria-hidden="true"></div>

    <div class="welcome-content">
      <div class="school-identity">
        <img v-if="app.logoUrl" :src="app.logoUrl" :alt="app.name + ' logo'" class="school-identity-logo" @error="handleLogoError" />
        <img v-else src="/admin/assets/images/school-welcome.svg" alt="School emblem illustration" class="school-identity-logo school-identity-fallback" />
        <div class="school-identity-copy">
          <span>Welcome to</span>
          <h1>{{ app.name }}</h1>
          <p>Learning <i></i> Character <i></i> Bright futures</p>
        </div>
      </div>

      <div class="welcome-message">
        <p class="welcome-kicker">YOUR SCHOOL, ALL IN ONE PLACE</p>
        <h2>{{ app.tagline }}</h2>
        <span class="welcome-rule"></span>
        <p class="welcome-description">{{ app.description }}</p>
      </div>

      <div class="welcome-features" aria-label="School portal features">
        <article><i class="fa-solid fa-users"></i><span>Manage<br />Students</span></article>
        <article><i class="fa-solid fa-book-open"></i><span>Academic<br />Records</span></article>
        <article><i class="fa-solid fa-chart-column"></i><span>Exams &amp;<br />Results</span></article>
        <article><i class="fa-solid fa-chart-pie"></i><span>Reports &amp;<br />Analytics</span></article>
      </div>
    </div>

    <div class="welcome-wave" aria-hidden="true"></div>
    <footer class="welcome-footer">
      <blockquote><span aria-hidden="true">“</span><p>Education is the light that guides us toward a brighter future.</p></blockquote>
      <p class="welcome-copyright">&copy; {{ year }} — Built by Hubi-Infotech</p>
    </footer>
  </section>

  <main class="login-panel">
    <div class="login-card-modern" :class="{ 'registration-card': isRegisterMode }">
      <div v-if="!isRegisterMode">
        <header class="login-card-heading">
          <h2>School Admin Login</h2>
          <p>Enter your credentials to access the school portal</p>
        </header>

        <form id="loginForm" class="modern-login-form" @submit.prevent="handleLogin" novalidate>
          <label class="modern-field">
            <span>Username or email</span>
            <div class="modern-input-wrap">
              <i class="fa-regular fa-user" aria-hidden="true"></i>
              <input id="login_email" v-model.trim="identifier" type="text" placeholder="Username or email" autocomplete="username" />
            </div>
          </label>

          <label class="modern-field">
            <span>{{ isPinLogin ? 'PIN' : 'Password' }}</span>
            <div class="modern-input-wrap">
              <i class="fa-solid fa-lock" aria-hidden="true"></i>
              <input
                v-if="isPinLogin"
                id="login_pin"
                v-model="pin"
                :type="showPin ? 'text' : 'password'"
                placeholder="Enter 4-digit PIN"
                inputmode="numeric"
                maxlength="4"
                autocomplete="one-time-code"
                @input="pin = pin.replace(/\\D/g, '').slice(0, 4)"
                @blur="handlePinBlur"
              />
              <input
                v-else
                id="login_password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                autocomplete="current-password"
              />
              <button v-if="isPinLogin" class="visibility-toggle" type="button" :aria-label="showPin ? 'Hide PIN' : 'Show PIN'" @click="showPin = !showPin"><i :class="showPin ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye'" aria-hidden="true"></i></button>
              <button v-else class="visibility-toggle" type="button" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword"><i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye'" aria-hidden="true"></i></button>
            </div>
            <small v-if="isPinLogin" class="field-hint">PIN must be exactly 4 digits.</small>
          </label>

          <div class="login-options">
            <label class="remember-option"><input type="checkbox" v-model="remember" /><span>Remember me</span></label>
            <a href="#/forgot">{{ isPinLogin ? 'Forgot PIN?' : 'Forgot password?' }}</a>
          </div>

          <button type="submit" class="login-submit" :disabled="loading">
            <span>{{ loading ? 'Signing in…' : 'Login' }}</span>
            <i v-if="!loading" class="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </button>
        </form>

        <div class="login-divider"><span>OR</span></div>
        <button class="alternate-login" type="button" @click="isPinLogin ? switchToPassword() : switchToPin()">
          <i :class="isPinLogin ? 'fa-solid fa-key' : 'fa-solid fa-hashtag'" aria-hidden="true"></i>
          {{ isPinLogin ? 'Login with password' : 'Login with PIN' }}
        </button>
        <p class="secure-note"><i class="fa-solid fa-shield-halved" aria-hidden="true"></i> Secure access for authorized school staff only</p>
        <p class="registration-link">Don't have an account? <a href="#" @click.prevent="isRegisterMode = true">Register here</a></p>
      </div>

      <!-- Registration remains available for installations that use it. -->
      <div v-else>
        <div class="mb-3 text-center">
          <h5 class="mb-1">Register Your School</h5>
          <p class="text-muted small mb-0">Setup your school account in 2 steps</p>
        </div>

        <form @submit.prevent="handleRegister">
          <!-- School Section -->
          <div class="mb-2">
            <small class="text-muted fw-bold d-block mb-2">📚 School Information</small>
          </div>

          <div class="row mb-2">
            <div class="col-6">
              <label class="form-label small">School Name *</label>
              <input v-model="schoolName" type="text" class="form-control form-control-sm" placeholder="School name" required minlength="3" />
            </div>
            <div class="col-6">
              <label class="form-label small">School Code *</label>
              <input v-model="schoolCode" type="text" class="form-control form-control-sm" placeholder="Code" required minlength="2" />
            </div>
          </div>

          <div class="mb-2">
            <label class="form-label small">Email *</label>
            <input v-model="schoolEmail" type="email" class="form-control form-control-sm" placeholder="school@example.com" required />
          </div>

          <div class="row mb-3">
            <div class="col-6">
              <label class="form-label small">Phone</label>
              <input v-model="schoolPhone" type="tel" class="form-control form-control-sm" placeholder="Phone" pattern="[0-9]{10}" />
            </div>
            <div class="col-6">
              <label class="form-label small">City</label>
              <input v-model="schoolCity" type="text" class="form-control form-control-sm" placeholder="City" minlength="2" />
            </div>
          </div>

          <!-- Admin Section -->
          <div class="mb-2 mt-3">
            <small class="text-muted fw-bold d-block mb-2">👤 Admin User</small>
          </div>

          <div class="row mb-2">
            <div class="col-6">
              <label class="form-label small">Username *</label>
              <input v-model="adminUsername" type="text" class="form-control form-control-sm" placeholder="Username" required minlength="3" />
            </div>
            <div class="col-6">
              <label class="form-label small">Email *</label>
              <input v-model="adminEmail" type="email" class="form-control form-control-sm" placeholder="Email" required />
            </div>
          </div>

          <div class="row mb-2">
            <div class="col-6">
              <label class="form-label small">Password *</label>
              <div class="input-group input-group-sm">
                <input 
                  v-model="adminPassword" 
                  :type="showRegisterPassword ? 'text' : 'password'" 
                  class="form-control form-control-sm" 
                  placeholder="Password"
                  required
                  minlength="6"
                />
                <button type="button" class="btn btn-outline-secondary" @click="showRegisterPassword = !showRegisterPassword" style="padding:0.25rem 0.5rem;">
                  <i :class="showRegisterPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" style="font-size:0.75rem;"></i>
                </button>
              </div>
            </div>
            <div class="col-6">
              <label class="form-label small">Confirm *</label>
              <div class="input-group input-group-sm">
                <input 
                  v-model="adminConfirmPassword" 
                  :type="showRegisterConfirmPassword ? 'text' : 'password'" 
                  class="form-control form-control-sm" 
                  placeholder="Confirm"
                  required
                  minlength="6"
                />
                <button type="button" class="btn btn-outline-secondary" @click="showRegisterConfirmPassword = !showRegisterConfirmPassword" style="padding:0.25rem 0.5rem;">
                  <i :class="showRegisterConfirmPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" style="font-size:0.75rem;"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label small">PIN (Optional)</label>
            <input v-model="adminPin" type="text" class="form-control form-control-sm" placeholder="4-digit" maxlength="4" inputmode="numeric" pattern="[0-9]{0,4}" />
          </div>

          <div class="form-check mb-3">
            <input v-model="agreeTerms" type="checkbox" class="form-check-input form-check-input-sm" id="agreeTerms" />
            <label class="form-check-label small" for="agreeTerms">
              I agree to <a href="#" @click.prevent class="text-primary">Terms & Conditions</a>
            </label>
          </div>

          <button type="submit" class="btn btn-success btn-sm w-100" :disabled="loading">
            <span v-if="!loading"><i class="fa-solid fa-check me-1"></i>Register</span>
            <span v-else><i class="fa-solid fa-spinner fa-spin me-1"></i>Registering...</span>
          </button>
        </form>

        <div class="text-center mt-3 small text-muted">
          Already have an account? <a href="#" @click.prevent="isRegisterMode = false" class="text-primary fw-bold">Login here</a>
        </div>
      </div>
    </div>
  </main>
</div>
`;
