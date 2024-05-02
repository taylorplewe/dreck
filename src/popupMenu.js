export const createPopupMenu = (items, x, y) => {
	const backdropEl = document.querySelector('#popup-backdrop');
	backdropEl.innerHTML = '';
	backdropEl.style.visibility = 'visible';
	const menuEl = document.createElement('div');
	menuEl.className = 'popup-menu';
	menuEl.style.top = `${y}px`;
	menuEl.style.left = `${x}px`;
	const listEl = document.createElement('ul');
	menuEl.appendChild(listEl);
	backdropEl.appendChild(menuEl);

	for (const item of items) {
		const itemEl = document.createElement('li');
		itemEl.className = 'popup-menu-item';
		itemEl.onclick = item.callback;
		itemEl.textContent = item.text;
		listEl.appendChild(itemEl);
	}

	// fade
	menuEl.style.opacity = 0;
	setTimeout(() => {
		menuEl.style.opacity = 1;
	});

	const clear = () => {
		menuEl.style.opacity = 0;
		setTimeout(() => {
			backdropEl.style.visibility = 'hidden';
		}, 200);
	}

	backdropEl.onclick = clear;
	menuEl.onclick = clear;
}