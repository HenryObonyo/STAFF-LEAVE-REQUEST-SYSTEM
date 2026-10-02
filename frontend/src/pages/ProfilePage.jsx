import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import {
  updateMyProfile,
  changeMyPassword,
} from "../api/client";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { user, setUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [profileStatus, setProfileStatus] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordStatus, setPasswordStatus] = useState("");
  const [passwordError, setPasswordError] = useState("");
  useEffect(() => {
    if (!profileStatus) return;

    const timer = setTimeout(() => {
      setProfileStatus("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [profileStatus]);

  useEffect(() => {
    if (!passwordStatus) return;

    const timer = setTimeout(() => {
      setPasswordStatus("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [passwordStatus]);


  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    setProfileStatus("");
    setProfileError("");

    try {
      const response = await updateMyProfile(profileForm);

      const updatedUser = response.user || response;

      if (updatedUser) {
        const mergedUser = {
          ...user,
          ...updatedUser,
        };

        setUser(mergedUser);

        localStorage.setItem(
          "leaveapp_user",
          JSON.stringify(mergedUser)
        );
      }

      setProfileStatus("Profile updated successfully.");
    } catch (error) {
      setProfileError(
        error.message || "Failed to update profile."
      );
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setPasswordStatus("");
    setPasswordError("");

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordError(
        "Please fill in all password fields."
      );
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError(
        "New password must be at least 6 characters long."
      );
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setPasswordError(
        "New password and confirmation password do not match."
      );
      return;
    }

    try {
      await changeMyPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordStatus(
        "Password changed successfully."
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordError(
        error.message || "Failed to change password."
      );
    }
  };

  const formattedRole =
    user?.role
      ?.replace("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      ) || "—";

  return (
    <DashboardLayout title="Your profile">

      {/* =========================================
          PROFILE DETAILS
          ========================================= */}

      <section className="panel profile-panel">
        <div className="profile-section-header">
          <h2>Profile Details</h2>

          <p>
            View the information associated with your account.
          </p>
        </div>

        <div className="profile-details-grid">

          <div className="profile-detail-item">
            <span className="profile-detail-label">
              Full name
            </span>

            <span className="profile-detail-value">
              {user?.name || "—"}
            </span>
          </div>

          <div className="profile-detail-item">
            <span className="profile-detail-label">
              Email address
            </span>

            <span className="profile-detail-value">
              {user?.email || "—"}
            </span>
          </div>

          <div className="profile-detail-item">
            <span className="profile-detail-label">
              Role
            </span>

            <span className="profile-detail-value">
              {formattedRole}
            </span>
          </div>

          <div className="profile-detail-item">
            <span className="profile-detail-label">
              Account status
            </span>

            <span
              className={`profile-status-badge ${user?.is_active
                ? "profile-status-active"
                : "profile-status-inactive"
                }`}
            >
              {user?.is_active ? "Active" : "Inactive"}
            </span>
          </div>

        </div>
      </section>


      {/* =========================================
          EDIT PROFILE
          ========================================= */}

      <section className="panel profile-panel">
        <div className="profile-section-header">
          <h2>Edit Profile</h2>

          <p>
            Update your personal account information.
          </p>
        </div>

        <form
          className="profile-form"
          onSubmit={handleProfileSubmit}
        >
          <div className="profile-form-grid">

            <div className="profile-field">
              <label htmlFor="name">
                Full name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={profileForm.name}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div className="profile-field">
              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                required
              />
            </div>

          </div>

          {profileStatus && (
            <p className="profile-success">
              {profileStatus}
            </p>
          )}

          {profileError && (
            <p className="profile-error">
              {profileError}
            </p>
          )}

          <button
            type="submit"
            className="profile-primary-button"
          >
            Save Changes
          </button>
        </form>
      </section>


      {/* =========================================
          CHANGE PASSWORD
          ========================================= */}

      <section className="panel profile-panel">
        <div className="profile-section-header">
          <h2>Change Password</h2>

          <p>
            Update your password to keep your account secure.
          </p>
        </div>

        <form
          className="profile-form password-form"
          onSubmit={handlePasswordSubmit}
        >

          <div className="profile-field">
            <label htmlFor="currentPassword">
              Current password
            </label>

            <div className="password-input-wrapper">
              <input
                id="currentPassword"
                name="currentPassword"
                type={
                  showCurrentPassword
                    ? "text"
                    : "password"
                }
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowCurrentPassword(
                    !showCurrentPassword
                  )
                }
              >
                {showCurrentPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>


          <div className="profile-field">
            <label htmlFor="newPassword">
              New password
            </label>

            <div className="password-input-wrapper">
              <input
                id="newPassword"
                name="newPassword"
                type={
                  showNewPassword
                    ? "text"
                    : "password"
                }
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowNewPassword(
                    !showNewPassword
                  )
                }
              >
                {showNewPassword ? "Hide" : "Show"}
              </button>
            </div>

            <small>
              Password must be at least 6 characters.
            </small>
          </div>


          <div className="profile-field">
            <label htmlFor="confirmPassword">
              Confirm new password
            </label>

            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {passwordStatus && (
            <p className="profile-success">
              {passwordStatus}
            </p>
          )}

          {passwordError && (
            <p className="profile-error">
              {passwordError}
            </p>
          )}

          <button
            type="submit"
            className="profile-primary-button"
          >
            Change Password
          </button>

        </form>
      </section>

    </DashboardLayout>
  );
}