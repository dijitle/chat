import React, { Fragment } from "react";
import { useAuth0 } from "./login";

const Profile = () => {
  const { loading, user } = useAuth0();

  if (loading || !user) {
    return <div></div>;
  }

  return (
    <Fragment>
      <img src={user.picture} alt="Profile" width="32px" height="32px" />

      <h2>{user.nickname}</h2>
      <p>{user.email}</p>
      <code>{JSON.stringify(user, null, 2)}</code>
    </Fragment>
  );
};

export default Profile;
