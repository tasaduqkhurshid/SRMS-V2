export default `<svg
  xmlns="http://www.w3.org/2000/svg"
  :viewBox="layout === 'stacked' ? '0 0 360 360' : layout === 'mark' ? '0 0 190 190' : '0 0 700 210'"
  :class="['sms-brand', 'sms-brand--' + variant, 'sms-brand--' + layout]"
  role="img"
  :aria-label="label"
  focusable="false"
>
  <template v-if="layout === 'stacked'">
    <g transform="translate(83 5)">
      <path d="M95 2 174 31 95 60 16 31 95 2Z" fill="#f7ae12" />
      <path d="M157 38v42" stroke="#f7ae12" stroke-width="5" stroke-linecap="round" />
      <circle cx="95" cy="67" r="12" fill="#08a9e5" />
      <path d="M38 88c22-19 41-23 57-8 16-15 35-11 57 8v53c-22-15-41-17-57-2-16-15-35-13-57 2V88Z" fill="#04a9e4" />
      <path d="M49 96c17-11 30-10 46 2v43c-16-12-29-13-46-5V96Zm92 0c-17-11-30-10-46 2v43c16-12 29-13 46-5V96Z" fill="#f8fbff" />
      <path d="M25 90v69c23-12 46-9 70 9 24-18 47-21 70-9V90" fill="none" stroke="#193c9b" stroke-width="8" stroke-linejoin="round" />
      <path d="M20 165c27-11 52-6 75 15 23-21 48-26 75-15" fill="none" stroke="#08a9e5" stroke-width="7" stroke-linecap="round" />
      <path d="M95 69v85" stroke="#193c9b" stroke-width="5" />
      <path d="m34 53 4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1 4-8Zm122 0 4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1 4-8Z" fill="#f7ae12" />
    </g>
    <text x="180" y="249" text-anchor="middle" class="sms-wordmark">SMS</text>
    <text x="180" y="279" text-anchor="middle" class="sms-descriptor">SCHOOL MANAGEMENT SYSTEM</text>
    <text x="180" y="307" text-anchor="middle" class="sms-tagline">MANAGE  •  EDUCATE  •  GROW</text>
  </template>
  <template v-else-if="layout === 'mark'">
    <g transform="translate(0 0)">
      <path d="M95 2 174 31 95 60 16 31 95 2Z" fill="#f7ae12" />
      <path d="M157 38v42" stroke="#f7ae12" stroke-width="5" stroke-linecap="round" />
      <circle cx="95" cy="67" r="12" fill="#08a9e5" />
      <path d="M38 88c22-19 41-23 57-8 16-15 35-11 57 8v53c-22-15-41-17-57-2-16-15-35-13-57 2V88Z" fill="#04a9e4" />
      <path d="M49 96c17-11 30-10 46 2v43c-16-12-29-13-46-5V96Zm92 0c-17-11-30-10-46 2v43c16-12 29-13 46-5V96Z" fill="#f8fbff" />
      <path d="M25 90v69c23-12 46-9 70 9 24-18 47-21 70-9V90" fill="none" stroke="#193c9b" stroke-width="8" stroke-linejoin="round" />
      <path d="M20 165c27-11 52-6 75 15 23-21 48-26 75-15" fill="none" stroke="#08a9e5" stroke-width="7" stroke-linecap="round" />
      <path d="M95 69v85" stroke="#193c9b" stroke-width="5" />
      <path d="m34 53 4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1 4-8Zm122 0 4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1 4-8Z" fill="#f7ae12" />
    </g>
  </template>
  <template v-else>
    <g transform="translate(12 8)">
      <path d="M88 2 164 30 88 58 12 30 88 2Z" fill="#f7ae12" />
      <path d="M148 37v39" stroke="#f7ae12" stroke-width="5" stroke-linecap="round" />
      <circle cx="88" cy="65" r="11" fill="#08a9e5" />
      <path d="M33 86c20-18 37-21 55-7 18-14 35-11 55 7v49c-20-13-37-15-55-1-18-14-35-12-55 1V86Z" fill="#04a9e4" />
      <path d="M43 94c16-10 28-9 45 2v39c-17-11-29-12-45-5V94Zm90 0c-16-10-28-9-45 2v39c17-11 29-12 45-5V94Z" fill="#f8fbff" />
      <path d="M21 88v64c21-11 42-8 67 8 25-16 46-19 67-8V88" fill="none" stroke="#193c9b" stroke-width="8" stroke-linejoin="round" />
      <path d="M16 157c25-10 47-5 72 14 25-19 47-24 72-14" fill="none" stroke="#08a9e5" stroke-width="7" stroke-linecap="round" />
      <path d="M88 67v79" stroke="#193c9b" stroke-width="5" />
      <path d="m30 50 4 7 8 1-6 6 2 8-8-4-8 4 2-8-6-6 8-1 4-7Zm116 0 4 7 8 1-6 6 2 8-8-4-8 4 2-8-6-6 8-1 4-7Z" fill="#f7ae12" />
    </g>
    <text x="215" y="101" class="sms-wordmark">SMS</text>
    <text x="219" y="137" class="sms-descriptor">SCHOOL MANAGEMENT SYSTEM</text>
    <text x="219" y="169" class="sms-tagline">MANAGE  •  EDUCATE  •  GROW</text>
  </template>
</svg>`;
