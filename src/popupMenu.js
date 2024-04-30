export const createPopupMenu = (items, x, y) => {
	const backdropEl = document.createElement('div');
	backdropEl.className = 'backdrop';
	const menuEl = document.createElement('div');
	menuEl.className = 'popup-menu';
	menuEl.style.top = `${y}px`;
	menuEl.style.left = `${x}px`;
	const listEl = document.createElement('ul');
	menuEl.appendChild(listEl);

	for (const item of items) {
		const itemEl = document.createElement('li');
		itemEl.className = 'popup-menu-item';
		itemEl.onclick = item.callback;
		listEl.appendChild(itemEl);
		const textEl = document.createElement('div');
		textEl.textContent = item.text;
		itemEl.appendChild(textEl);
	}

	document.body.appendChild(backdropEl);
	document.body.appendChild(menuEl);

	// fade
	menuEl.style.opacity = 0;
	setTimeout(() => {
		menuEl.style.opacity = 1;
	});

	const clear = () => {
		document.body.removeChild(backdropEl);
		menuEl.style.opacity = 0;
		setTimeout(() => {
			document.body.removeChild(menuEl);
		}, 200);
	}

	backdropEl.onclick = clear;
	menuEl.onclick = clear;
}