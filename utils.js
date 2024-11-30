export function copyCode(button) {
    const code = button.getAttribute('data-code');
    navigator.clipboard.writeText(code).then(() => {
        Toastify({
            text: "Đã sao chép mã!",
            duration: 2000,
            gravity: "bottom",
            position: "right",
            style: {
                background: "#4CAF50",
            }
        }).showToast();
    });
} 