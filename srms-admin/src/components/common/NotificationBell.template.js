export default `
<div class="admin-notification-bell-wrapper position-relative d-inline-block">
  <button
    type="button"
    class="btn btn-outline-secondary header-icon-btn header-notifications position-relative"
    aria-label="Notifications"
    @click="openModal"
  >
    <i class="fa-solid fa-bell"></i>
    <span
      v-if="notificationCount > 0"
      class="position-absolute top-0 start-100 translate-middle badge bg-danger rounded-pill"
      :class="notificationCount > 99 ? 'px-2' : ''"
    >
      {{ notificationCount > 99 ? '99+' : notificationCount }}
    </span>
  </button>

  <transition enter-active-class="transition ease-out duration-100" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition ease-in duration-75" leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-if="showModal" class="position-fixed inset-0" style="background: rgba(0,0,0,0.3); z-index: 1040;" @click="closeModal"></div>
  </transition>

  <transition enter-active-class="transition ease-out duration-100" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="opacity-100" leave-to-class="opacity-0 scale-95">
    <div v-if="showModal" class="position-fixed top-0 end-0 mt-4 me-4" style="z-index: 1050; min-width: 400px; max-width: 600px;" @click.stop>
      <div class="card border-0 shadow-lg" style="border-radius: 12px !important;">
        <!-- Header Card -->
        <div class="card-header bg-white border-bottom border-secondary py-2">
        <div class="d-flex align-items-center justify-content-between">
          <h5 class="mb-0 fw-semibold" style="font-size: 0.9rem;">Notifications</h5>
          <div class="d-flex gap-2">
            <button
              v-if="notificationCount > 0"
              type="button"
              class="btn btn-link btn-sm text-primary text-decoration-none fw-medium p-0 me-2"
              style="font-size: 0.75rem;"
              @click="markAllAsRead"
            >
              Mark all as read
            </button>
            <button
              type="button"
              class="btn btn-link btn-sm text-primary text-decoration-none fw-medium p-0"
              style="font-size: 0.75rem;"
              @click="goToNotificationsPage"
            >
              View all
            </button>
            <button type="button" class="btn btn-link text-decoration-none" @click="closeModal" style="font-size: 0.9rem;">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      </div>

        <!-- Notification List Card -->
        <div class="card-body p-0" style="max-height: 400px; overflow-y: auto;">
          <div v-if="loading" class="p-3 text-center text-muted">
            <i class="fa-solid fa-spinner fa-spin me-2"></i> Loading...
          </div>
          <div v-else-if="error" class="p-3 text-center text-danger">
            {{ error }}
            <button class="btn btn-link ms-2 text-primary text-decoration-underline" @click="fetchNotifications">Retry</button>
          </div>
          <div v-else-if="notifications.length === 0" class="p-3 text-center text-muted">
            <i class="fa-solid fa-bell-slash display-4 mb-2"></i>
            <p class="mb-0">No notifications yet</p>
          </div>
          <div v-else class="d-flex flex-column gap-1 p-2">
            <div
              v-for="notification in notifications"
              :key="notification._id"
              class="card border cursor-pointer"
              :class="{ 'border-primary bg-primary bg-opacity-10': !notification.isRead, 'border-light': notification.isRead }"
              style="border-radius: 6px !important;"
              @click="handleNotificationClick(notification)"
            >
              <div class="card-body p-2">
                <div class="d-flex align-items-start gap-2">
                  <div
                    class="notification-icon flex-shrink-0 rounded-circle d-flex align-items-center justify-content-center"
                    style="width: 1.5rem; height: 1.5rem; font-size: 0.65rem;"
                    :class="[
                      notification.type === 'success' ? 'bg-success bg-opacity-10 text-success' :
                      notification.type === 'warning' ? 'bg-warning bg-opacity-10 text-warning' :
                      notification.type === 'error' ? 'bg-danger bg-opacity-10 text-danger' :
                      'bg-info bg-opacity-10 text-info'
                    ]"
                  >
                    <i :class="getNotificationIcon(notification.type)" aria-hidden="true"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="d-flex align-items-start justify-content-between gap-2 mb-1">
                      <h6 class="fw-medium text-dark mb-0 truncate" style="font-size: 0.8rem;">{{ notification.title }}</h6>
                      <span class="text-muted flex-shrink-0" style="font-size: 0.65rem;">{{ formatTimeAgo(notification.createdAt) }}</span>
                    </div>
                    <p class="text-muted mb-1" style="font-size: 0.7rem; line-height: 1.3;">{{ notification.message }}</p>
                    <div class="d-flex align-items-center gap-2">
                      <span
                        class="badge rounded-pill"
                        style="font-size: 0.6rem; padding: 0.2rem 0.4rem;"
                        :class="[
                          notification.category === 'fees' ? 'bg-amber bg-opacity-10 text-amber' :
                          notification.category === 'examination' ? 'bg-purple bg-opacity-10 text-purple' :
                          notification.category === 'result' ? 'bg-success bg-opacity-10 text-success' :
                          notification.category === 'attendance' ? 'bg-info bg-opacity-10 text-info' :
                          notification.category === 'support' ? 'bg-orange bg-opacity-10 text-orange' :
                          notification.category === 'student' ? 'bg-pink bg-opacity-10 text-pink' :
                          notification.category === 'announcement' ? 'bg-indigo bg-opacity-10 text-indigo' :
                          'bg-secondary bg-opacity-10 text-secondary'
                        ]"
                      >
                        {{ notification.category }}
                      </span>
                      <span v-if="!notification.isRead" class="w-1.5 h-1.5 bg-primary rounded-circle" aria-label="Unread"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>

  <!-- All Notifications Full Modal with Blurred Background -->
  <transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-if="allNotificationsOpen" class="position-fixed inset-0" style="z-index: 1060; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); background: rgba(0,0,0,0.45);" @click="allNotificationsOpen = false"></div>
  </transition>

  <transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 scale-90" enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-90">
    <div v-if="allNotificationsOpen" class="position-fixed top-50% left-50% translate-middle" style="z-index: 1070; min-width: 500px; max-width: 800px; max-height: 80vh;" @click.stop>
      <div class="card border-0 shadow-lg" style="border-radius: 16px !important; overflow: hidden;">
        <div class="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
          <h5 class="mb-0 fw-semibold">All Notifications</h5>
          <button type="button" class="btn btn-link text-decoration-none" @click="allNotificationsOpen = false" style="font-size: 0.9rem;">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="card-body p-4" style="max-height: 60vh; overflow-y: auto;">
          <div v-if="loading" class="p-3 text-center text-muted">
            <i class="fa-solid fa-spinner fa-spin me-2"></i> Loading...
          </div>
          <div v-else-if="error" class="p-3 text-center text-danger">
            {{ error }}
            <button class="btn btn-link ms-2 text-primary text-decoration-underline" @click="fetchAllNotifications">Retry</button>
          </div>
          <div v-else-if="allNotifications.length === 0" class="p-3 text-center text-muted">
            <i class="fa-solid fa-bell-slash display-4 mb-2"></i>
            <p class="mb-0">No notifications yet</p>
          </div>
          <div v-else class="d-flex flex-column gap-2">
            <div
              v-for="notification in allNotifications"
              :key="notification._id"
              class="card border cursor-pointer"
              :class="{ 'border-primary bg-primary bg-opacity-05': !notification.is_read, 'border-light': notification.is_read }"
              style="border-radius: 10px !important; padding: 0; overflow: hidden;"
              @click="handleNotificationClick(notification)"
            >
              <div class="card-body p-3">
                <div class="d-flex align-items-start gap-2">
                  <div
                    class="notification-icon flex-shrink-0 rounded-circle d-flex align-items-center justify-content-center"
                    style="width: 2rem; height: 2rem; font-size: 0.75rem;"
                    :class="[
                      notification.type === 'success' ? 'bg-success bg-opacity-10 text-success' :
                      notification.type === 'warning' ? 'bg-warning bg-opacity-10 text-warning' :
                      notification.type === 'error' ? 'bg-danger bg-opacity-10 text-danger' :
                      'bg-info bg-opacity-10 text-info'
                    ]"
                  >
                    <i :class="getNotificationIcon(notification.type)" aria-hidden="true"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="d-flex align-items-start justify-content-between gap-2 mb-1">
                      <h6 class="fw-medium text-dark mb-0 truncate" style="font-size: 0.85rem;">{{ notification.title }}</h6>
                      <span class="text-muted flex-shrink-0" style="font-size: 0.7rem;">{{ formatTimeAgo(notification.created_at) }}</span>
                    </div>
                    <p class="text-muted mb-2" style="font-size: 0.8rem; line-height: 1.4;">{{ notification.message }}</p>
                    <div class="d-flex align-items-center gap-2">
                      <span
                        class="badge rounded-pill"
                        style="font-size: 0.65rem; padding: 0.2rem 0.5rem;"
                        :class="[
                          notification.category === 'fees' ? 'bg-amber bg-opacity-10 text-amber' :
                          notification.category === 'examination' ? 'bg-purple bg-opacity-10 text-purple' :
                          notification.category === 'result' ? 'bg-success bg-opacity-10 text-success' :
                          notification.category === 'attendance' ? 'bg-info bg-opacity-10 text-info' :
                          notification.category === 'support' ? 'bg-orange bg-opacity-10 text-orange' :
                          notification.category === 'student' ? 'bg-pink bg-opacity-10 text-pink' :
                          notification.category === 'announcement' ? 'bg-indigo bg-opacity-10 text-indigo' :
                          'bg-secondary bg-opacity-10 text-secondary'
                        ]"
                      >
                        {{ notification.category }}
                      </span>
                      <span v-if="!notification.is_read" class="w-2 h-2 bg-primary rounded-circle" aria-label="Unread"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</div>
`;