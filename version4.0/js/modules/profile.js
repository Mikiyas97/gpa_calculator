import { getLocalProfile, saveLocalProfile, syncProfileToCloud } from "./storage.js";
import { initAuth, logoutUser } from "./auth.js";
import { auth } from "./firebase.js";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export function initProfileModal() {
    const userInfo = document.getElementById("user-info");
    const profileModal = document.getElementById("profileModal");
    const profileForm = document.getElementById("profile-form");
    
    const viewMode = document.getElementById("profile-view-mode");
    const editMode = document.getElementById("profile-edit-mode");
    const editBtn = document.getElementById("editProfileBtn");
    const cancelEditBtn = document.getElementById("cancelEditBtn");
    const closeModalBtns = document.querySelectorAll(".close-modal-btn");
    const modalLogoutBtn = document.getElementById("modalLogoutBtn");

    if (!userInfo || !profileModal) return;

    userInfo.style.cursor = "pointer";
    userInfo.addEventListener("click", () => {
        const profile = getLocalProfile();
        if (!profile || !profile.student || !profile.student.name) {
            showEditMode();
        } else {
            showViewMode();
        }
        profileModal.style.display = "flex";
    });

    editBtn.addEventListener("click", showEditMode);
    cancelEditBtn.addEventListener("click", () => {
        const profile = getLocalProfile();
        if (!profile || !profile.student || !profile.student.name) {
            profileModal.style.display = "none";
        } else {
            showViewMode();
        }
    });

    closeModalBtns.forEach(btn => {
        btn.addEventListener("click", () => profileModal.style.display = "none");
    });

    if (modalLogoutBtn) {
        modalLogoutBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to logout?")) {
                logoutUser();
                profileModal.style.display = "none";
            }
        });
    }

    function showViewMode() {
        loadProfileData();
        viewMode.style.display = "block";
        editMode.style.display = "none";
    }

    function showEditMode() {
        loadProfileData();
        viewMode.style.display = "none";
        editMode.style.display = "block";
    }

    profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const profile = {
            student: {
                name: document.getElementById("p-student-name").value,
                program: document.getElementById("p-student-program").value,
                email: document.getElementById("p-student-email").value,
                phone: document.getElementById("p-student-phone").value,
                image: DEFAULT_AVATAR // Keep it simple and light
            },
            uni: {
                name: document.getElementById("p-uni-name").value,
                college: document.getElementById("p-uni-college").value,
                dept: document.getElementById("p-uni-dept").value,
                location: document.getElementById("p-uni-location").value
            }
        };

        saveLocalProfile(profile);
        prefillTranscriptForm();
        showViewMode();
        
        const user = auth.currentUser;
        if (user) {
            syncProfileToCloud(user.uid, profile);
        }

        alert("Profile Updated Successfully!");
    });

    window.addEventListener("click", (e) => {
        if (e.target == profileModal) profileModal.style.display = "none";
    });
}

export function checkNewUserProfile(user) {
    if (!user) return;
    setTimeout(() => {
        const profile = getLocalProfile();
        if (!profile || !profile.student || !profile.student.name) {
            const profileModal = document.getElementById("profileModal");
            if (profileModal) {
                document.getElementById("profile-view-mode").style.display = "none";
                document.getElementById("profile-edit-mode").style.display = "block";
                profileModal.style.display = "flex";
            }
        }
    }, 1500);
}

function loadProfileData() {
    const profile = getLocalProfile();
    document.getElementById("v-student-name").innerText = profile.student?.name || "-";
    document.getElementById("v-student-program").innerText = profile.student?.program || "-";
    document.getElementById("v-student-email").innerText = profile.student?.email || "-";
    document.getElementById("v-student-phone").innerText = profile.student?.phone || "-";
    
    const vImage = document.getElementById("v-profile-image");
    vImage.innerHTML = `<img src="${DEFAULT_AVATAR}" style="width:100%; height:100%; object-fit:cover;">`;

    document.getElementById("v-uni-name").innerText = profile.uni?.name || "-";
    document.getElementById("v-uni-college").innerText = profile.uni?.college || "-";
    document.getElementById("v-uni-dept").innerText = profile.uni?.dept || "-";
    document.getElementById("v-uni-location").innerText = profile.uni?.location || "-";

    document.getElementById("p-student-name").value = profile.student?.name || "";
    document.getElementById("p-student-program").value = profile.student?.program || "";
    document.getElementById("p-student-email").value = profile.student?.email || "";
    document.getElementById("p-student-phone").value = profile.student?.phone || "";
    
    document.getElementById("p-uni-name").value = profile.uni?.name || "";
    document.getElementById("p-uni-college").value = profile.uni?.college || "";
    document.getElementById("p-uni-dept").value = profile.uni?.dept || "";
    document.getElementById("p-uni-location").value = profile.uni?.location || "";
}

export function prefillTranscriptForm() {
    const profile = getLocalProfile();
    if (!profile || !profile.student) return;

    const fields = {
        "student-name": profile.student.name,
        "student-program": profile.student.program,
        "student-email": profile.student.email,
        "student-phone": profile.student.phone,
        "uni-name": profile.uni?.name,
        "uni-college": profile.uni?.college,
        "uni-dept": profile.uni?.dept,
        "uni-location": profile.uni?.location
    };

    for (const [id, value] of Object.entries(fields)) {
        const el = document.getElementById(id);
        if (el && value) el.value = value;
    }
}
