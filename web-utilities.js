export function downloadBlob(name, blob) {
  let link = document.createElement('a');
  link.download = name;
  link.href = URL.createObjectURL(blob);

  // Firefox needs the element to be live for some reason.
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
  });
}

export function downloadJson(name, data) {
	const options = {
		type: 'application/json',
	};
  console.log("data:", data);
	downloadBlob(name, new Blob([JSON.stringify(data, null, 2)], options));
}
