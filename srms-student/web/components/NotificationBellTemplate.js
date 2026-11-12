export default `
<div class="student-notification-bell-wrapper relative">
  <button
    class="btn header-icon-btn header-notifications relative"
    type="button"
    @click="toggleDropdown"
    aria-label="Notifications"
    aria-expanded="showDropdown"
    aria-haspopup="true"
  >
    <i class="fa-solid fa-bell"></i>
    <span
      v-if="notificationCount > 0"
      class="header-notification-badge absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
      :class="notificationCount > 99 ? 'w-auto px-1.5' : ''"
    >
      {{ notificationCount > 99 ? '99+' : notificationCount }}
    </span>
  </button>

  <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
    <div v-if="showDropdown" class="notification-dropdown fixed right-4 top-full mt-2 w-80 md:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div class="notification-dropdown-header p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 class="font-semibold text-gray-900">Notifications</h3>
        <div class="flex items-center gap-2">
          <button
            v-if="notificationCount > 0"
            class="text-sm text-primary-600 hover:text-primary-700 font-medium"
            @click="markAllAsRead"
          >
            Mark all as read
          </button>
          <router-link
            to="/notifications"
            class="text-sm text-primary-600 hover:text-primary-700 font-medium"
            @click.native="showDropdown = false"
          >
            View all
          </router-link>
        </div>
      </div>

      <div class="notification-list max-h-96 overflow-y-auto">
        <div v-if="loading" class="p-4 text-center text-gray-500">
          <i class="fa-solid fa-spinner fa-spin"></i> Loading...
        </div>
        <div v-else-if="error" class="p-4 text-center text-red-500">
          {{ error }}
          <button class="ml-2 text-primary-600 hover:underline" @click="fetchNotifications">Retry</button>
        </div>
        <div v-else-if="notifications.length === 0" class="p-4 text-center text-gray-500">
          <i class="fa-solid fa-bell-slash text-3xl mb-2"></i>
          <p>No notifications yet</p>
        </div>
        <div v-else>
          <div
            v-for="notification in notifications"
            :key="notification._id"
            class="notification-item p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
            :class="{ 'bg-blue-50': !notification.is_read }"
            @click="handleNotificationClick(notification)"
          >
            <div class="flex items-start gap-3">
              <div
                class="notification-icon flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                :class="[
                  notification.type === 'success' ? 'bg-green-100 text-green-600' :
                  notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                  notification.type === 'error' ? 'bg-red-100 text-red-600' :
                  'bg-blue-100 text-blue-600'
                ]"
              >
                <i :class="getNotificationIcon(notification.type)" aria-hidden="true"></i>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <h4 class="font-medium text-gray-900 truncate">{{ notification.title }}</h4>
                  <span class="text-xs text-gray-400 flex-shrink-0">{{ formatTimeAgo(notification.created_at) }}</span>
                </div>
                <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ notification.message }}</p>
                <div class="flex items-center gap-2 mt-2">
                  <span
                    class="px-2 py-0.5 text-xs font-medium rounded-full"
                    :class="[
                      notification.category === 'fees' ? 'bg-amber-100 text-amber-700' :
                      notification.category === 'examination' ? 'bg-purple-100 text-purple-700' :
                      notification.category === 'result' ? 'bg-green-100 text-green-700' :
                      notification.category === 'attendance' ? 'bg-blue-100 text-blue-700' :
                      notification.category === 'support' ? 'bg-orange-100 text-orange-700' :
                      notification.category === 'student' ? 'bg-pink-100 text-pink-700' :
                      'bg-gray-100 text-gray-700'
                    ]"
                  >
                    {{ notification.category }}
                  </span>
                  <span v-if="!notification.is_read" class="w-2 h-2 bg-primary-600 rounded-full" aria-label="Unread"></span>
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