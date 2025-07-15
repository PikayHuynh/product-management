// Change Status
const buttonsChangeStatus = document.querySelectorAll("[button-change-status]");
if(buttonsChangeStatus.length > 0) {
    const formChangeStatus = document.querySelector("#form-change-status");
    const path = formChangeStatus.getAttribute("data-path");
    buttonsChangeStatus.forEach(button => {
        button.addEventListener("click", () => {
            const statusCurrent = button.getAttribute("data-status");
            const id = button.getAttribute("data-id");
            let statusChange = statusCurrent == "active" ? "inactive" : "active";
            const action = path + `/${statusChange}/${id}?_method=PATCH`;
            
            formChangeStatus.action = action;
            formChangeStatus.submit();
        });
    });
} 
// End Change Status

// Delete Item
const buttonsDelete = document.querySelectorAll("[button-delete]");
if(buttonsDelete.length > 0) {
    const formDeleteItem = document.querySelector("#form-delete-item");
    const path = formDeleteItem.getAttribute("data-path");
    
    buttonsDelete.forEach(button =>  {
        button.addEventListener("click", () => {
            const isComfirm = confirm("Bạn có chắc muốn xóa sản phẩm này ?");

            if(isComfirm) {
                const id = button.getAttribute("data-id");
                
                const action = `${path}/${id}?_method=DELETE`;
                
                formDeleteItem.action = action;
                formDeleteItem.submit();
            } 
        });
    });
}
// End Delete Item

// Restore Item
const buttonsRestore = document.querySelectorAll("[button-restore]");
if(buttonsRestore.length > 0) {
    const formRestoreItem = document.querySelector("#form-restore");
    const path = formRestoreItem.getAttribute("data-path");

    buttonsRestore.forEach(button => {
        button.addEventListener("click", () => {
            const isComfirm = confirm("Bạn có chắc muốn khôi phục lại sản phẩm này ?");
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
        const isComfirm = confirm("Bạn có chắc muốn khôi phục nhiều sản phẩm này không ?");
        if(isComfirm) {
            const checkboxMulti = document.querySelector("[checkbox-multi]");
            const inputsChecked = checkboxMulti.querySelectorAll("input[name='id']:checked");
            console.log(inputsChecked);
            
            
            if(inputsChecked.length > 0) {
                let ids = [];
                const inputIds = formRestoreMulti.querySelector("input[name='ids']");
                inputsChecked.forEach(input => {
                    const id = input.value;                    
                    ids.push(id);
                });
                inputIds.value = ids.join(", ");
                formRestoreMulti.submit();
            }
        } else {
            alert("Vui lòng chọn ít nhất một sản phẩm!");
        }
    });
}

// End Form Restore Multi