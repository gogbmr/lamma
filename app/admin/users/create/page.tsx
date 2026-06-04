"use client";

import UserForm from "../user-form";

export default function CreateUserPage() {
  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New User</h1>
        <p className="text-muted-foreground mt-2">
          Add a new user account to the system with custom permissions
        </p>
      </div>

      <UserForm />
    </main>
  );
}