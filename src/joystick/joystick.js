const teethEl = document.querySelector('.teeth');

let defaultShortcuts = ['n', 'nw', 'w', 'sw', 's', 'se', 'e', 'ne'];
let shortcuts = [];
for (const name of defaultShortcuts) shortcuts.push({name});
let isEditing = false;

let intervalDeg = 360/shortcuts.length;
const toothCenterTranslate = 'translate(-.5px, -24px)';
const toothMoveOuterTranslate = 'translate(0px, -63px)';

const updateTeeth = degs => {
	let currentDeg = degs;
	teethEl.innerHTML = '';
	// create tooth elements
	for (let shortcut of shortcuts) {
		const toothEl = document.createElement('div');
		toothEl.className = 'tooth';
		toothEl.style.transform = `${toothCenterTranslate} rotate(${currentDeg}deg) ${toothMoveOuterTranslate}`;
		teethEl.appendChild(toothEl);
		
		shortcut.start = currentDeg;
		shortcut.end = (currentDeg + intervalDeg) % 360;
		
		// text
		const textDeg = currentDeg + intervalDeg/2;
		const textEl = document.createElement('p');
		const shouldBeRightAligned = textDeg % 360 > 180;
		const shouldBeCentered = textDeg % 180 > 170 || textDeg % 180 < 10;
		const alignTranslate =
			shouldBeCentered ? 'translate(-50%, 0)'
			: shouldBeRightAligned ? 'translate(-100%, 0)'
			: '';
		textEl.textContent = shortcut.name;
		textEl.className = 'tooth-text';
		textEl.style.transform = `rotate(${textDeg}deg) translate(0, -90px) rotate(${-textDeg}deg) ${alignTranslate}`;
		if (textDeg > 180) {
			textEl.style.textAlign = 'right';
		}
		teethEl.appendChild(textEl);

		currentDeg = (currentDeg + intervalDeg) % 360;
	}
};
updateTeeth(338);


// rotate the cog
const cogCenterEl = document.querySelector('.cog-center');
const cogEl = document.querySelector('.cog');
const getDeg = point => (Math.atan2(point.y, point.x) * 180) / Math.PI;
let startDeg = 0;
let currentDeg = 0;
let oldDeg = 0;
let isRotating = false;
const getEventPointFromCenter = e => {
	const elRect = cogCenterEl.getBoundingClientRect();
	return {
		x: e.clientX - elRect.x,
		y: e.clientY - elRect.y,
	}
};

// joystick
const joystickEl = document.querySelector('.joystick');
let isDragging = false;
let joyPosDiff;
let joyDeg;
let joyPreviewTimeout;
const activatePreview = () => {
	joyPreviewTimeout = setTimeout(() => {
		teethEl.style.opacity = 1;
	}, 500);
}
const deactivatePreview = () => {
	clearTimeout(joyPreviewTimeout);
	teethEl.style.opacity = 0;
}
const checkJoystickForShortcut = () => {
	joyDeg = parseInt(getDeg(joyPosDiff) + 90) % 360;
	if (joyDeg < 0) joyDeg += 360;
	let targetShortcutName;
	for (const s of shortcuts) {
		if (joyDeg > s.start && joyDeg < s.end) targetShortcutName = s.name;
		if (s.end < s.start && (joyDeg > s.start || joyDeg < s.end)) targetShortcutName = s.name;
	}
	if (!targetShortcutName) targetShortcutName = shortcuts[shortcuts.length-1].name;
	cogEl.style.backgroundColor = '#444';
	cogEl.textContent = targetShortcutName;
};
const cancelPreviewAction = () => {
	cogEl.style.backgroundColor = 'transparent';
	cogEl.textContent = '';
}
const actionRelease = () => {
	cancelPreviewAction();
	// do action
}
const constrainJoystick = (x, y) => {
	if (!isDragging) return;
	const elRect = cogCenterEl.getBoundingClientRect();
	const center = {
		x: elRect.x,
		y: elRect.y,
	};
	const radius = (cogEl.getBoundingClientRect().width/2) * 1.5;
	const xdiff = x - center.x;
	const ydiff = y - center.y;
	const hyp = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
	if (hyp < radius) {
		joystickEl.style.top = `${y}px`;
		joystickEl.style.left = `${x}px`;
	} else {
		const factor = radius / hyp;
		joystickEl.style.top = `${center.y + (ydiff * factor)}px`;
		joystickEl.style.left = `${center.x + (xdiff * factor)}px`;
	}
 	// do the actual action
	if (hyp >= radius * 0.6) {
		checkJoystickForShortcut();
		deactivatePreview();
	} else {
		cancelPreviewAction();
	}
};
const joyDragStart = e => {
	if (isEditing) return;
	isDragging = true;
	joystickEl.style.visibility = 'visible';
	joystickEl.style.top = `${e.clientY}px`;
	joystickEl.style.left = `${e.clientX}px`;
	activatePreview();
}
const joyDragMove = e => {
	if (!isDragging) return;
	joyPosDiff = getEventPointFromCenter(e);
	constrainJoystick(e.clientX, e.clientY);
}
const joyDragEnd = () => {
	if (!isDragging) return;
	joystickEl.style.visibility = 'hidden';
	isDragging = false;
	actionRelease();
	deactivatePreview();
}
// mouse
cogEl.addEventListener('mousedown', e => joyDragStart(e));
document.addEventListener('mousemove', e => joyDragMove(e));
document.addEventListener('mouseup', joyDragEnd);

// do not allow user to select text in the joystick/cog
const absorbTouchEvent = e => {
	e.returnValue = false;
	e.preventDefault();
}
cogEl.addEventListener('touchstart', absorbTouchEvent);
cogEl.addEventListener('touchmove', absorbTouchEvent);
cogEl.addEventListener('touchend', absorbTouchEvent);
cogEl.addEventListener('touchcancel', absorbTouchEvent);

// touch
cogEl.addEventListener('touchstart', ({ touches: { 0: touch } }) => joyDragStart(touch));
document.addEventListener('touchmove', ({ touches: { 0: touch } }) => joyDragMove(touch));
document.addEventListener('touchend', joyDragEnd);