const imageInput = document.getElementById("imageInput");
const previewContainer = document.getElementById("previewContainer");

let selectedFiles = [];

if (imageInput) {
  imageInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);

    files.forEach(file => {
      selectedFiles.push(file);
    });

    renderPreviews();
    updateFileInput();
  });
}

function renderPreviews() {
  previewContainer.innerHTML = "";

  selectedFiles.forEach((file, index) => {
    const reader = new FileReader();

    reader.onload = () => {
      const div = document.createElement("div");
      div.style.position = "relative";

      div.innerHTML = `
        <img src="${reader.result}"
          style="width:90px;height:90px;object-fit:cover;border-radius:8px;border:1px solid #ddd;">
        <button
          type="button"
          onclick="removeImage(${index})"
          style="
            position:absolute;
            top:-6px;
            right:-6px;
            background:#000;
            color:#fff;
            border:none;
            border-radius:50%;
            width:22px;
            height:22px;
            font-size:14px;
            cursor:pointer;
          "
        >✖</button>
      `;

      previewContainer.appendChild(div);
    };

    reader.readAsDataURL(file);
  });
}

function removeImage(index) {
  selectedFiles.splice(index, 1);
  renderPreviews();
  updateFileInput();
}

function updateFileInput() {
  const dataTransfer = new DataTransfer();
  selectedFiles.forEach(file => dataTransfer.items.add(file));
  imageInput.files = dataTransfer.files;
}
