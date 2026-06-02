export default `
<div class="login-split min-vh-100 d-flex">
  <!-- Left -->
  <aside class="login-left d-flex flex-column justify-content-center align-items-start p-5">
    <div class="card left-card w-100 border-0 shadow-sm p-4">
      <div class="d-flex align-items-start gap-3">
        <div class="flex-fill ms-2">
          <img :src="app.logoUrl" alt="App Logo" class="mb-3 login-logo" style="height:120px; width:auto; max-width:100%;" />
          <h6 class="text-muted mb-1">Welcome To</h6>
          <h2 class="fw-bold mb-2">{{ app.name }}</h2>
          <p class="text-muted mb-3">{{ app.tagline }}</p>
          <ul class="list-unstyled text-muted small mb-0">
            <li class="mb-2"><i class="fa-solid fa-check text-success me-2"></i> Manage students & classes</li>
            <li class="mb-2"><i class="fa-solid fa-check text-success me-2"></i> Create exams & publish results</li>
            <li><i class="fa-solid fa-check text-success me-2"></i> Import / export & backups</li>
          </ul>
        </div>
      </div>
      <div class="mt-4 pt-3 border-top text-muted small">
        &copy; {{ year }} — Built by Hubi-Infotech
      </div>
    </div>
  </aside>

  <!-- Right -->
  <main class="login-right d-flex align-items-center justify-content-center p-4">
    <div class="card shadow-lg p-4" style="max-width:600px; width:100%; border-radius:12px;">
      <!-- LOGIN MODE -->
      <div v-if="!isRegisterMode">
        <div class="mb-3 text-center">
          <h5 class="mb-1">Sign in to continue</h5>
          <p class="text-muted small mb-0">Enter your credentials to access the admin panel</p>
        </div>

        <!-- Auto-validated form -->
        <form id="loginForm" data-vform @validated-submit="handleLogin" novalidate>
          <!-- Email -->
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input
              id="login_email"
              v-model.trim="email"
              type="email"
              class="form-control form-control-lg"
              placeholder="admin@example.com"
              data-vtype="email"
            />
          </div>

          <!-- PIN (shown in PIN mode) -->
          <div class="mb-3" v-if="isPinLogin">
            <label class="form-label">PIN</label>
            <div class="position-relative">
              <i class="fa-solid fa-key position-absolute"
                 style="left:14px; top:50%; transform:translateY(-50%); color:#6c757d;"></i>

              <input
                id="login_pin"
                :type="showPin ? 'text' : 'password'"
                v-model="pin"
                class="form-control"
                placeholder="••••"
                inputmode="numeric"
                maxlength="4"
                pattern="[0-9]*"
                @input="pin = pin.replace(/\\D/g, '').slice(0, 4)"
                @blur="handlePinBlur"
                style="
                  padding-left: 42px;
                  letter-spacing: 0.6rem;
                  font-size: 2.1rem;
                  height: 52px;
                  font-weight: 600;
                  text-align: center;
                "
                data-vtype="number"
                data-vmin="4" 
                data-vmax="4"   
              />
            </div>

            <div class="d-flex justify-content-between mt-1">
              <span class="small text-primary" style="cursor:pointer;" @click="showPin = !showPin">
                {{ showPin ? "Hide PIN" : "Show PIN" }}
              </span>
              <span class="small text-primary" style="cursor:pointer;" @click="switchToPassword">
                Use password instead
              </span>
            </div>

            <div class="form-text">PIN must be exactly 4 digits.</div>
          </div>

          <!-- Password (shown in password mode) -->
          <div class="mb-2" v-else>
            <label class="form-label">Password</label>
            <input
              id="login_password"
              :type="showPassword ? 'text' : 'password'"
              v-model.trim="password"
              class="form-control form-control-lg"
              placeholder="Enter password"
              data-vtype="text"
              data-vmin="4"
            />
            <div class="d-flex justify-content-between mt-1">
              <span class="small text-primary" style="cursor:pointer;" @click="showPassword = !showPassword">
                {{ showPassword ? "Hide Password" : "Show Password" }}
              </span>
              <span class="small text-primary" style="cursor:pointer;" @click="isPinLogin = true">
                Use PIN instead
              </span>
            </div>
          </div>

          <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="remember" v-model="remember" />
              <label class="form-check-label small" for="remember">Remember me</label>
            </div>
            <a class="small" href="#/forgot">Forgot?</a>
          </div>

          <button type="submit" class="btn btn-primary btn-lg w-100" :disabled="loading">
            <span v-if="!loading">Login</span>
            <span v-else>Logging in…</span>
          </button>
        </form>

        <div class="text-center mt-3 small text-muted">
          Don't have an account? <a href="#" @click.prevent="isRegisterMode = true" class="text-primary fw-bold">Register here</a>
        </div>
      </div>

      <!-- REGISTER MODE -->
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
