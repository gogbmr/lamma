"use client";

import { useEffect, useMemo, useState } from "react";

import {
Search,
Plus,
Pencil,
Trash2,
Users,
} from "lucide-react";

import { toast } from "sonner";

import { UploadButton } from "@/lib/uploadthing";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
Card,
CardContent,
CardHeader,
CardTitle,
} from "@/components/ui/card";

import {
Dialog,
DialogContent,
DialogHeader,
DialogTitle,
} from "@/components/ui/dialog";

import {
Table,
TableBody,
TableCell,
TableHead,
TableHeader,
TableRow,
} from "@/components/ui/table";

interface Tutor {
id: string;

name: string;

bio: string | null;

avatar: string | null;

createdAt: string;

_count?: {
courses: number;
};
}

export default function TutorsPage() {
const [loading, setLoading] =
useState(true);

const [tutors, setTutors] =
useState<Tutor[]>([]);

const [search, setSearch] =
useState("");

const [sortBy, setSortBy] =
useState<
"name" | "createdAt"
>("createdAt");

const [page, setPage] =
useState(1);

const pageSize = 10;

const [open, setOpen] =
useState(false);

const [editingTutor, setEditingTutor] =
useState<Tutor | null>(
null
);

const [name, setName] =
useState("");

const [bio, setBio] =
useState("");

const [avatar, setAvatar] =
useState("");

async function fetchTutors() {
try {
setLoading(true);

 
  const res =
    await fetch(
      "/api/admin/tutors"
    );

  const data =
    await res.json();

  setTutors(data);
} catch {
  toast.error(
    "Failed to load tutors"
  );
} finally {
  setLoading(false);
}
 

}

useEffect(() => {
fetchTutors();
}, []);

const filteredTutors =
useMemo(() => {
let result = [
...tutors,
];

 
  if (search) {
    result =
      result.filter(
        (tutor) =>
          tutor.name
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );
  }

  result.sort(
    (a, b) => {
      if (
        sortBy ===
        "name"
      ) {
        return a.name.localeCompare(
          b.name
        );
      }

      return (
        new Date(
          b.createdAt
        ).getTime() -
        new Date(
          a.createdAt
        ).getTime()
      );
    }
  );

  return result;
}, [
  tutors,
  search,
  sortBy,
]);
 

const totalPages =
Math.ceil(
filteredTutors.length /
pageSize
);

const paginatedTutors =
filteredTutors.slice(
(page - 1) *
pageSize,
page * pageSize
);

function openCreateModal() {
setEditingTutor(
null
);

 
setName("");
setBio("");
setAvatar("");

setOpen(true);
 

}

function openEditModal(
tutor: Tutor
) {
setEditingTutor(
tutor
);

 
setName(
  tutor.name
);

setBio(
  tutor.bio || ""
);

setAvatar(
  tutor.avatar || ""
);

setOpen(true);
 

}
async function handleSubmit() {
try {
if (!name.trim()) {
toast.error(
"Tutor name is required"
);
return;
}

 
  const payload = {
    name,
    bio,
    avatar,
  };

  const url =
    editingTutor
      ? `/api/admin/tutors/${editingTutor.id}`
      : "/api/admin/tutors";

  const method =
    editingTutor
      ? "PUT"
      : "POST";

  const res =
    await fetch(url, {
      method,

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify(
          payload
        ),
    });

  const data =
    await res.json();

  if (!res.ok) {
    throw new Error(
      data.error ||
        "Something went wrong"
    );
  }

  toast.success(
    editingTutor
      ? "Tutor updated"
      : "Tutor created"
  );

  setOpen(false);

  fetchTutors();
} catch (
  error: any
) {
  toast.error(
    error.message
  );
}
 

}

async function handleDelete(
id: string
) {
const confirmed =
window.confirm(
"Delete this tutor?"
);

 
if (!confirmed) {
  return;
}

try {
  const res =
    await fetch(
      `/api/admin/tutors/${id}`,
      {
        method:
          "DELETE",
      }
    );

  const data =
    await res.json();

  if (!res.ok) {
    throw new Error(
      data.error
    );
  }

  toast.success(
    "Tutor deleted"
  );

  fetchTutors();
} catch (
  error: any
) {
  toast.error(
    error.message
  );
}
 

}

return ( <div className="space-y-6">

 
  <div className="flex items-center justify-between">

    <div>
      <h1 className="text-3xl font-bold">
        Tutors
      </h1>

      <p className="text-muted-foreground">
        Manage course tutors
      </p>
    </div>

    <Button
      onClick={
        openCreateModal
      }
    >
      <Plus className="h-4 w-4 mr-2" />

      Add Tutor
    </Button>

  </div>

  <Card>

    <CardHeader>

      <CardTitle className="flex items-center gap-2">
        <Users className="h-5 w-5" />

        Tutors
      </CardTitle>

    </CardHeader>

    <CardContent>

      <div className="flex gap-4 mb-6">

        <div className="relative flex-1">

          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

          <Input
            placeholder="Search tutors..."
            className="pl-10"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(
              e.target
                .value as any
            )
          }
          className="border rounded-md px-3"
        >
          <option value="createdAt">
            Newest
          </option>

          <option value="name">
            Name
          </option>
        </select>

      </div>

      <Table>

        <TableHeader>

          <TableRow>

            <TableHead>
              Avatar
            </TableHead>

            <TableHead>
              Name
            </TableHead>

            <TableHead>
              Bio
            </TableHead>

            <TableHead>
              Courses
            </TableHead>

            <TableHead>
              Created
            </TableHead>

            <TableHead className="text-right">
              Actions
            </TableHead>

          </TableRow>

        </TableHeader>

        <TableBody>

          {paginatedTutors.map(
            (tutor) => (
              <TableRow
                key={
                  tutor.id
                }
              >
                <TableCell>
                  {tutor.avatar ? (
                    <img
                      src={
                        tutor.avatar
                      }
                      alt={
                        tutor.name
                      }
                      className="h-12 w-12 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full border flex items-center justify-center">
                      {tutor.name
                        ?.charAt(
                          0
                        )
                        ?.toUpperCase()}
                    </div>
                  )}
                </TableCell>

                <TableCell className="font-medium">
                  {
                    tutor.name
                  }
                </TableCell>

                <TableCell className="max-w-sm truncate">
                  {tutor.bio}
                </TableCell>

                <TableCell>
                  {
                    tutor
                      ._count
                      ?.courses
                  }
                </TableCell>

                <TableCell>
                  {new Date(
                    tutor.createdAt
                  ).toLocaleDateString()}
                </TableCell>

                <TableCell>
                  <div className="flex justify-end gap-2">

                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        openEditModal(
                          tutor
                        )
                      }
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() =>
                        handleDelete(
                          tutor.id
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                  </div>
                </TableCell>

              </TableRow>
            )
          )}

        </TableBody>

      </Table>
 
 
      <div className="flex items-center justify-between mt-6">

        <div className="text-sm text-muted-foreground">
          Showing{" "}
          {paginatedTutors.length} of{" "}
          {filteredTutors.length} tutors
        </div>

        <div className="flex gap-2">

          <Button
            variant="outline"
            disabled={
              page === 1
            }
             
            onClick={() =>
              setPage(
                (prev) =>
                  prev - 1
              )
            }
          >
            Previous
          </Button>

          <div className="flex items-center px-3 text-sm">
            Page {page} of {totalPages || 1}
          </div>

          <Button
            variant="outline"
            disabled={
              page >= totalPages
            }
            onClick={() =>
              setPage(
                (prev) =>
                  prev + 1
              )
            }
          >
            Next
          </Button>

        </div>

      </div>

    </CardContent>

  </Card>

  <Dialog
    open={open}
    onOpenChange={setOpen}
  >
    <DialogContent
     style={{
    position: "fixed",
    left: "50vw",
    top: "70vh",
    transform:
      "translate(-50%, -50%)",
  }}
        className="
          max-w-2xl
          border-white
          bg-purple-100 
          dark:bg-zinc-900
          shadow-2xl
        "
      >

      <DialogHeader>

        <DialogTitle className="text-2xl">
          {editingTutor
            ? "Edit Tutor"
            : "Add Tutor"}
        </DialogTitle>

      </DialogHeader>

      <div className="space-y-6">

        <div className="space-y-2">

          <label className="text-sm font-medium">
            Tutor Name
          </label>

          <Input
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            placeholder="Tutor name"
          />

        </div>

        <div className="space-y-2">

          <label className="text-sm font-medium">
            Bio
          </label>

          <textarea
            className="w-full min-h-[120px] border rounded-md p-3"
            value={bio}
            onChange={(e) =>
              setBio(
                e.target.value
              )
            }
            placeholder="Tutor biography"
          />

        </div>

        <div className="space-y-2">

          <label className="text-sm font-medium">
            Avatar
          </label>

          {avatar ? (
            <div className="space-y-3">

              <img
                src={avatar}
                alt="Tutor"
                className="h-28 w-28 rounded-full object-cover border"
              />

              <Button
                type="button"
                variant="destructive"
                onClick={() =>
                  setAvatar("")
                }
              >
                Remove Avatar
              </Button>

            </div>
          ) : (
            <UploadButton
              endpoint="tutorAvatar"
              onClientUploadComplete={(
                res
              ) => {
                if (
                  res?.[0]
                ) {
                  setAvatar(
                    res[0]
                      .ufsUrl
                  );

                  toast.success(
                    "Avatar uploaded"
                  );
                }
              }}
              onUploadError={(
                error
              ) => {
                toast.error(
                  error.message
                );
              }}
            />
          )}

        </div>

        <div className="flex justify-end gap-3">

          <Button
            variant="outline"
            onClick={() =>
              setOpen(false)
            }
          >
            Cancel
          </Button>

          <Button
            onClick={
              handleSubmit
            }
          >
            {editingTutor
              ? "Update Tutor"
              : "Create Tutor"}
          </Button>

        </div>

      </div>

    </DialogContent>

  </Dialog>

</div>
 

);
}

