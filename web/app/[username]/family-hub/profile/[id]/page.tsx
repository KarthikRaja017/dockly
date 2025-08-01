import React from "react";
import ProfileClient from "./profileClient";

interface PageProps {
    params: {
        username: string;
        id: string;
    };
}

const ProfilePage = async ({ params }: PageProps) => {
    return <ProfileClient memberId={params.id} />;
};

export default ProfilePage;
