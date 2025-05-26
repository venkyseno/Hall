// Close modal when clicking 'X' or outside
document.querySelector('.close').addEventListener('click', closeModal);
window.addEventListener('click', function(event) {
    if (event.target === document.getElementById('booking-modal')) {
        closeModal();
    }
});

function closeModal() {
    document.getElementById('booking-modal').style.display = 'none';
}