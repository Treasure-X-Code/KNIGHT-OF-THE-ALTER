const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav');
const joinForm = document.querySelector('#join-form');
const formMessage = document.querySelector('.form-message');
menuToggle?.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
});
navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    navigation.classList.remove('active');
    menuToggle?.setAttribute('aria-expanded', 'false');
}));

const memberCount = document.querySelector('#member-count');
const rsvpCount = document.querySelector('#rsvp-count');
const prayerList = document.querySelector('#prayer-list');
const memberTableBody = document.querySelector('#member-table-body');
const memberSearch = document.querySelector('#member-search');
const rankCount = document.querySelector('#rank-count');
const attendanceCount = document.querySelector('#attendance-count');

const renderDesk = () => {
    memberCount.textContent = database.members.length;
    rsvpCount.textContent = database.rsvps.length;
    rankCount.textContent = new Set(database.members.map((member) => member.rank)).size;
    attendanceCount.textContent = database.rsvps.length;
    const savedIntentions = database.intentions.slice(-3).reverse();
    prayerList.innerHTML = savedIntentions.length
        ? savedIntentions.map((intention) => `<li>${escapeHTML(intention)}</li>`).join('')
        : '<li>For joyful service at every Mass.</li><li>For our parish families and schools.</li>';
    renderMembers();
};

const renderMembers = () => {
    const query = (memberSearch?.value || '').trim().toLowerCase();
    const members = database.members.filter((member) => `${member.name} ${member.rank} ${member.service}`.toLowerCase().includes(query));
    memberTableBody.innerHTML = members.length
        ? members.map((member) => `<tr><td>${escapeHTML(member.name)}</td><td>${escapeHTML(member.rank)}</td><td>${escapeHTML(member.service)}</td><td>${new Date(member.joinedAt).toLocaleDateString()}</td></tr>`).join('')
        : '<tr><td colspan="4">No member records match this search.</td></tr>';
};

document.querySelectorAll('[data-event]').forEach((button) => {
    const eventName = button.dataset.event;
    if (database.rsvps.includes(eventName)) {
        button.textContent = 'Joined ✓';
        button.classList.add('is-joined');
    }
    button.addEventListener('click', () => {
        const joined = database.rsvps.includes(eventName);
        database.rsvps = joined ? database.rsvps.filter((item) => item !== eventName) : [...database.rsvps, eventName];
        saveDatabase();
        button.textContent = joined ? "I'll be there" : 'Joined ✓';
        button.classList.toggle('is-joined', !joined);
        renderDesk();
    });
});

joinForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(joinForm);
    const member = {
        name: String(formData.get('name')).trim(),
        phone: String(formData.get('phone')).trim(),
        rank: String(formData.get('rank')),
        service: String(formData.get('service')),
        joinedAt: new Date().toISOString()
    };
    database.members = [...database.members.filter((item) => item.phone !== member.phone), member];
    saveDatabase();
    formMessage.textContent = `Thank you, ${member.name}. Your ${member.rank.toLowerCase()} profile is recorded.`;
    joinForm.reset();
    renderDesk();
});

document.querySelector('#prayer-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.querySelector('input');
    const intention = input.value.trim();
    database.intentions.push(intention);
    saveDatabase();
    input.value = '';
    form.querySelector('.desk-message').textContent = 'Your intention has been added.';
    renderDesk();
});

const recordsButton = document.querySelector('#records-button');
const recordsPanel = document.querySelector('#records-panel');
const recordsAuth = document.querySelector('#records-auth');
const coordinatorPinInput = document.querySelector('#coordinator-pin');
const securityMessage = document.querySelector('#security-message');
recordsButton?.addEventListener('click', () => {
    if (!recordsPanel.hidden) {
        recordsPanel.hidden = true;
        recordsAuth.hidden = true;
        recordsButton.innerHTML = 'Unlock records <span aria-hidden="true">&#8594;</span>';
        return;
    }
    recordsAuth.hidden = !recordsAuth.hidden;
    coordinatorPinInput.focus();
});
recordsAuth?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (coordinatorPinInput.value !== coordinatorPin) {
        securityMessage.textContent = 'Access denied. Check the PIN and try again.';
        coordinatorPinInput.select();
        return;
    }
    recordsPanel.hidden = false;
    recordsAuth.hidden = true;
    recordsButton.textContent = 'Lock records';
    coordinatorPinInput.value = '';
    securityMessage.textContent = '';
    renderMembers();
});
memberSearch?.addEventListener('input', renderMembers);

saveDatabase();
renderDesk();