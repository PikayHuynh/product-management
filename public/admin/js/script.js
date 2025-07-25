// Button status
const buttonsStatus = document.querySelectorAll("[button-status]"); //Thuộc tính tự định nghĩa
if(buttonsStatus.length > 0) {
  let url = new URL(window.location.href);
  buttonsStatus.forEach((button) => {
    button.addEventListener("click", () => {
      const status = button.getAttribute("button-status"); //lấy giá trị thuộc tính
      if(status) {
        url.searchParams.set("status", status);
      } else {
        url.searchParams.delete("status");
      }
      window.location.href = url.href; //Chuyển hướng url
    });
  });
}
// End Button status

// Form Search
const formSearch = document.querySelector("#form-search");
if(formSearch) {
  let url = new URL(window.location.href);
  formSearch.addEventListener("submit", (e) => {
    e.preventDefault();
    const keyword = e.target.elements.keyword.value;

    if(keyword) {
      url.searchParams.set("keyword", keyword);
    } else {
      url.searchParams.delete("keyword");
    }
    window.location.href = url.href;
  });
}
// End Form Search

// Pagination
const buttonsPagination = document.querySelectorAll("[button-pagination]");
if(buttonsPagination) {
  let url = new URL(window.location.href);
  buttonsPagination.forEach((button) => {
    button.addEventListener("click", () => {
      const page = button.getAttribute("button-pagination");
      url.searchParams.set("page", page);
      window.location.href = url.href;
    });
  });
}
// End Pagination

// Checkbox Multi
const checkboxMulti = document.querySelector("[checkbox-multi]");
if(checkboxMulti) {
  const inputCheckAll = checkboxMulti.querySelector("input[name='checkall']");
  const inputsId = checkboxMulti.querySelectorAll("input[name='id']");

  inputCheckAll.addEventListener("click", () => {
    if(inputCheckAll.checked) {
      inputsId.forEach((input) => {
        input.checked = true;
      });
    } else {
      inputsId.forEach((input) => {
        input.checked = false;
      });
    }
  });

  inputsId.forEach((input) => {
    input.addEventListener("click", () => {
      const countChecked = checkboxMulti.querySelectorAll("input[name='id']:checked").length;
      if(countChecked == inputsId.length) {
        inputCheckAll.checked = true;
      } else {
        inputCheckAll.checked = false;
      }
    });
  });
}
// End Checkbox Multi

// Form Change Multi
const formChangeMulti = document.querySelector("[form-change-multi]");
if(formChangeMulti) {
  formChangeMulti.addEventListener("submit", (e) => {
    e.preventDefault();
    const checkboxMulti = document.querySelector("[checkbox-multi]");
    const inputsChecked = checkboxMulti.querySelectorAll("input[name='id']:checked");

    const typeChange = e.target.elements.type.value;

    if(typeChange == "delete-all") {
      const isConfirm = confirm("Bạn có chắc muốn xóa những item này ?");
      if(!isConfirm) {
        return;
      }
    }

    if(inputsChecked.length > 0) {
      let ids = [];
      const inputIds = formChangeMulti.querySelector("input[name='ids']");
      inputsChecked.forEach((input) => {
        const id = input.value;

        if(typeChange == "change-position") {
          const position = input
            .closest("tr")
            .querySelector("input[name='position']").value;
          ids.push(`${id}-${position}`);
        } else {
          ids.push(id);
        }
      });
      inputIds.value = ids.join(", ");
      formChangeMulti.submit();
    } else {
      alert("Vui lòng chọn ít nhất một item!");
    }
  });
}
// End Form Change Multi

// Show Alert
const showAlert = document.querySelector("[show-alert]");
if(showAlert) {
  const time = parseInt(showAlert.getAttribute("data-time"));
  const closeAlert = showAlert.querySelector("[close-alert]");

  setTimeout(() => {
    showAlert.classList.add("alert-hidden");
  }, time);

  closeAlert.addEventListener("click", () => {
    showAlert.classList.add("alert-hidden");
  });
}
// End Show Alert

// Upload Image
const uploadImage = document.querySelector("[upload-image]");
if(uploadImage) {
  const uploadImageInput = document.querySelector("[upload-image-input]");
  const uploadImagePreview = document.querySelector("[upload-image-preview]");

  uploadImageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if(file) {
      uploadImagePreview.src = URL.createObjectURL(file);
    }
  });

  const deleteUploadImage = document.querySelector("[delete-upload-image]");

  deleteUploadImage.addEventListener("click", () => {
    uploadImagePreview.src = "";
    uploadImageInput.value = "";
  });
}
// End Upload Image

// Sort 
const sort = document.querySelector("[sort]");
if(sort) {
  let url = new URL(window.location.href);
  const sortSelect = sort.querySelector("[sort-select]");

  //Sort
  const sortClear = sort.querySelector("[sort-clear]");
  sortSelect.addEventListener("change", (e) => {
    const value = e.target.value;
    const [sortKey, sortValue] = value.split("-");
    url.searchParams.set("sortKey", sortKey);
    url.searchParams.set("sortValue", sortValue);

    window.location.href = url.href;
  });
  // End Sort

  // Clear Sort
  sortClear.addEventListener("click", () => {
    url.searchParams.delete("sortKey");
    url.searchParams.delete("sortValue");
    window.location.href = url.href;
  });
  // End Clear Sort

  // Selected option
  const sortKey = url.searchParams.get("sortKey");
  const sortValue = url.searchParams.get("sortValue");

  if(sortKey && sortValue) {
    const stringSort = `${sortKey}-${sortValue}`;
    const optionSelected = sortSelect.querySelector(`option[value='${stringSort}']`);
    optionSelected.selected = true;
    // optionSelected.setAttribute("selected", "true");
  }

}
//End Sort 

// Restore Item
const buttonsRestore = document.querySelectorAll("[button-restore]");
if(buttonsRestore.length > 0) {
  const formRestoreItem = document.querySelector("#form-restore");
  const path = formRestoreItem.getAttribute("data-path");

  buttonsRestore.forEach((button) => {
    button.addEventListener("click", () => {
      const isComfirm = confirm("Bạn có chắc muốn khôi phục lại item này ?");
      if(isComfirm) {
        const id = button.getAttribute("data-id");
        const action = `${path}/${id}?_method=PATCH`;

        formRestoreItem.action = action;
        formRestoreItem.submit();
      }
    });
  });
}
//End Restore Item

// Form Restore Multi
const formRestoreMulti = document.querySelector("[form-restore-multi]");
if(formRestoreMulti) {
  formRestoreMulti.addEventListener("submit", (e) => {
    e.preventDefault();
    const isComfirm = confirm("Bạn có chắc muốn khôi phục nhiều item này không ?");
    if(isComfirm) {
      const checkboxMulti = document.querySelector("[checkbox-multi]");
      const inputsChecked = checkboxMulti.querySelectorAll("input[name='id']:checked");
      console.log(inputsChecked);

      if(inputsChecked.length > 0) {
        let ids = [];
        const inputIds = formRestoreMulti.querySelector("input[name='ids']");
        inputsChecked.forEach((input) => {
          const id = input.value;
          ids.push(id);
        });
        inputIds.value = ids.join(", ");
        formRestoreMulti.submit();
      }
    } else {
      alert("Vui lòng chọn ít nhất một item!");
    }
  });
}
// End Form Restore Multi