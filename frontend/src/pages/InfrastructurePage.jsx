import { useEffect, useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { Field } from "../components/Field";
import { FormActions } from "../components/FormActions";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { TableCard } from "../components/TableCard";
import { useAuth } from "../context/AuthContext";
import { BED_STATUSES, ROOM_TYPES, ROLES } from "../lib/constants";
import { bedsApi, roomsApi, wardsApi } from "../services/api";
import { formatDate, getErrorMessage } from "../lib/utils";

const initialWardForm = {
  name: "",
  description: ""
};

const initialRoomForm = {
  wardId: "",
  roomNumber: "",
  type: "General"
};

const initialBedForm = {
  roomId: "",
  bedNumber: "",
  status: "AVAILABLE"
};

export function InfrastructurePage() {
  const { user, activeHospitalId } = useAuth();
  const [wards, setWards] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [wardForm, setWardForm] = useState(initialWardForm);
  const [roomForm, setRoomForm] = useState(initialRoomForm);
  const [bedForm, setBedForm] = useState(initialBedForm);
  const [editing, setEditing] = useState({ wardId: "", roomId: "", bedId: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canMutate = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN].includes(user.role);
  const canDelete = user.role === ROLES.SUPER_ADMIN;

  if (![ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN].includes(user.role)) {
    return (
      <EmptyState
        title="Infrastructure management is restricted"
        description="Only super admins and hospital admins can manage wards, rooms, and beds."
      />
    );
  }

  const roomMap = useMemo(() => Object.fromEntries(rooms.map((room) => [room._id, room])), [rooms]);
  const wardMap = useMemo(() => Object.fromEntries(wards.map((ward) => [ward._id, ward])), [wards]);

  useEffect(() => {
    let cancelled = false;

    async function loadInfrastructure() {
      if (!activeHospitalId) {
        setWards([]);
        setRooms([]);
        setBeds([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [wardsResponse, roomsResponse, bedsResponse] = await Promise.all([
          wardsApi.list({ hospitalId: activeHospitalId }),
          roomsApi.list({ hospitalId: activeHospitalId }),
          bedsApi.list({ hospitalId: activeHospitalId })
        ]);

        if (!cancelled) {
          setWards(wardsResponse.items);
          setRooms(roomsResponse.items);
          setBeds(bedsResponse.items);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInfrastructure();

    return () => {
      cancelled = true;
    };
  }, [activeHospitalId]);

  const refresh = async () => {
    const [wardsResponse, roomsResponse, bedsResponse] = await Promise.all([
      wardsApi.list({ hospitalId: activeHospitalId }),
      roomsApi.list({ hospitalId: activeHospitalId }),
      bedsApi.list({ hospitalId: activeHospitalId })
    ]);
    setWards(wardsResponse.items);
    setRooms(roomsResponse.items);
    setBeds(bedsResponse.items);
  };

  const handleSubmit = async (event, type) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      if (type === "ward") {
        if (editing.wardId) {
          await wardsApi.update(editing.wardId, { ...wardForm, hospitalId: activeHospitalId });
          setMessage("Ward updated successfully.");
        } else {
          await wardsApi.create({ ...wardForm, hospitalId: activeHospitalId });
          setMessage("Ward created successfully.");
        }
        setWardForm(initialWardForm);
        setEditing((current) => ({ ...current, wardId: "" }));
      }

      if (type === "room") {
        if (editing.roomId) {
          await roomsApi.update(editing.roomId, roomForm);
          setMessage("Room updated successfully.");
        } else {
          await roomsApi.create(roomForm);
          setMessage("Room created successfully.");
        }
        setRoomForm(initialRoomForm);
        setEditing((current) => ({ ...current, roomId: "" }));
      }

      if (type === "bed") {
        const payload = { ...bedForm, hospitalId: activeHospitalId };
        if (editing.bedId) {
          await bedsApi.update(editing.bedId, payload);
          setMessage("Bed updated successfully.");
        } else {
          await bedsApi.create(payload);
          setMessage("Bed created successfully.");
        }
        setBedForm(initialBedForm);
        setEditing((current) => ({ ...current, bedId: "" }));
      }

      await refresh();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (type, id) => {
    setError("");
    setMessage("");

    try {
      if (type === "ward") {
        await wardsApi.remove(id);
      }
      if (type === "room") {
        await roomsApi.remove(id);
      }
      if (type === "bed") {
        await bedsApi.remove(id);
      }

      setMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully.`);
      await refresh();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  };

  if (!activeHospitalId) {
    return (
      <EmptyState
        title="Choose an active hospital"
        description="Infrastructure is hospital-scoped, so select a hospital before managing wards, rooms, and beds."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Workflow 07"
        title="Wards, rooms, and beds"
        description="Build the hospital occupancy structure before admitting patients."
      />

      {error ? <div className="inline-banner error">{error}</div> : null}
      {message ? <div className="inline-banner success">{message}</div> : null}

      <div className="three-column-grid">
        <TableCard title="Wards" description={loading ? "Refreshing..." : `${wards.length} wards loaded`}>
          <form className="entity-form" onSubmit={(event) => handleSubmit(event, "ward")}>
            <Field
              label="Ward Name"
              name="name"
              value={wardForm.name}
              onChange={(event) => setWardForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
            <Field
              label="Description"
              name="description"
              value={wardForm.description}
              onChange={(event) => setWardForm((current) => ({ ...current, description: event.target.value }))}
              multiline
            />
            {canMutate ? (
              <FormActions
                isEditing={Boolean(editing.wardId)}
                onCancel={() => {
                  setWardForm(initialWardForm);
                  setEditing((current) => ({ ...current, wardId: "" }));
                }}
                submitting={submitting}
              />
            ) : null}
          </form>
          <DataTable
            columns={[
              { key: "name", label: "Ward" },
              { key: "description", label: "Description", render: (row) => row.description || "—" },
              { key: "createdAt", label: "Created", render: (row) => formatDate(row.createdAt) }
            ]}
            rows={wards}
            emptyText="No wards found."
            renderActions={(row) => (
              <>
                {canMutate ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditing((current) => ({ ...current, wardId: row._id }));
                      setWardForm({ name: row.name || "", description: row.description || "" });
                    }}
                  >
                    Edit
                  </button>
                ) : null}
                {canDelete ? (
                  <button type="button" className="btn btn-danger" onClick={() => handleDelete("ward", row._id)}>
                    Delete
                  </button>
                ) : null}
              </>
            )}
          />
        </TableCard>

        <TableCard title="Rooms" description={`${rooms.length} rooms linked to the active hospital`}>
          <form className="entity-form" onSubmit={(event) => handleSubmit(event, "room")}>
            <Field
              label="Ward"
              name="wardId"
              value={roomForm.wardId}
              onChange={(event) => setRoomForm((current) => ({ ...current, wardId: event.target.value }))}
              options={wards.map((ward) => ({ label: ward.name, value: ward._id }))}
              required
            />
            <Field
              label="Room Number"
              name="roomNumber"
              value={roomForm.roomNumber}
              onChange={(event) => setRoomForm((current) => ({ ...current, roomNumber: event.target.value }))}
              required
            />
            <Field
              label="Type"
              name="type"
              value={roomForm.type}
              onChange={(event) => setRoomForm((current) => ({ ...current, type: event.target.value }))}
              options={ROOM_TYPES}
            />
            {canMutate ? (
              <FormActions
                isEditing={Boolean(editing.roomId)}
                onCancel={() => {
                  setRoomForm(initialRoomForm);
                  setEditing((current) => ({ ...current, roomId: "" }));
                }}
                submitting={submitting}
              />
            ) : null}
          </form>
          <DataTable
            columns={[
              { key: "roomNumber", label: "Room" },
              { key: "wardId", label: "Ward", render: (row) => wardMap[row.wardId]?.name || row.wardId || "—" },
              { key: "type", label: "Type" },
              { key: "createdAt", label: "Created", render: (row) => formatDate(row.createdAt) }
            ]}
            rows={rooms}
            emptyText="No rooms found."
            renderActions={(row) => (
              <>
                {canMutate ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditing((current) => ({ ...current, roomId: row._id }));
                      setRoomForm({
                        wardId: row.wardId || "",
                        roomNumber: row.roomNumber || "",
                        type: row.type || "General"
                      });
                    }}
                  >
                    Edit
                  </button>
                ) : null}
                {canDelete ? (
                  <button type="button" className="btn btn-danger" onClick={() => handleDelete("room", row._id)}>
                    Delete
                  </button>
                ) : null}
              </>
            )}
          />
        </TableCard>

        <TableCard title="Beds" description={`${beds.length} beds with room and occupancy status`}>
          <form className="entity-form" onSubmit={(event) => handleSubmit(event, "bed")}>
            <Field
              label="Room"
              name="roomId"
              value={bedForm.roomId}
              onChange={(event) => setBedForm((current) => ({ ...current, roomId: event.target.value }))}
              options={rooms.map((room) => ({
                label: `${room.roomNumber} (${wardMap[room.wardId]?.name || "Ward"})`,
                value: room._id
              }))}
              required
            />
            <Field
              label="Bed Number"
              name="bedNumber"
              value={bedForm.bedNumber}
              onChange={(event) => setBedForm((current) => ({ ...current, bedNumber: event.target.value }))}
              required
            />
            <Field
              label="Status"
              name="status"
              value={bedForm.status}
              onChange={(event) => setBedForm((current) => ({ ...current, status: event.target.value }))}
              options={BED_STATUSES}
            />
            {canMutate ? (
              <FormActions
                isEditing={Boolean(editing.bedId)}
                onCancel={() => {
                  setBedForm(initialBedForm);
                  setEditing((current) => ({ ...current, bedId: "" }));
                }}
                submitting={submitting}
              />
            ) : null}
          </form>
          <DataTable
            columns={[
              { key: "bedNumber", label: "Bed" },
              {
                key: "roomId",
                label: "Room",
                render: (row) => row.roomId?.roomNumber || roomMap[row.roomId]?.roomNumber || "—"
              },
              { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
              { key: "createdAt", label: "Created", render: (row) => formatDate(row.createdAt) }
            ]}
            rows={beds}
            emptyText="No beds found."
            renderActions={(row) => (
              <>
                {canMutate ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditing((current) => ({ ...current, bedId: row._id }));
                      setBedForm({
                        roomId: row.roomId?._id || row.roomId || "",
                        bedNumber: row.bedNumber || "",
                        status: row.status || "AVAILABLE"
                      });
                    }}
                  >
                    Edit
                  </button>
                ) : null}
                {canDelete ? (
                  <button type="button" className="btn btn-danger" onClick={() => handleDelete("bed", row._id)}>
                    Delete
                  </button>
                ) : null}
              </>
            )}
          />
        </TableCard>
      </div>
    </>
  );
}
