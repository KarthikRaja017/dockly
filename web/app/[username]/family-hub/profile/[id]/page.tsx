// app/[username]/family-hub/profile/[id]/page.tsx
import React from "react";
import ProfileClient from "./profileClient";

interface PageProps {
    params: {
        username: string;
        id: string;
    };
}

function ProfilePage({ params }: PageProps) {
    return <ProfileClient memberId={params.id} />;
}

export default ProfilePage;