// Button status
const buttonsStatus = document.querySelectorAll("[button-status]"); //Thuộc tính tự định nghĩa
if(buttonsStatus.length > 0) {
    let url = new URL(window.location.href);
    
    buttonsStatus.forEach(button => {
        button.addEventListener("click", () => {
            const status = button.getAttribute("button-status"); //lấy giá trị thuộc tính
            if(status) {
                url.searchParams.set("status", status);
            } else {
                url.searchParams.delete("status");
            }
            window.location.href = url.href; //Chuyển hướng url
        })
    });
}

// End Button status

