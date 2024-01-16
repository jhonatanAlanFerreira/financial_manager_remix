import PrimaryButton from "~/components/buttons/primary-button/PrimaryButton";
import { requireUserSession } from "~/data/auth.server";
import { Modal } from "react-responsive-modal";
import { useState } from "react";

export default function Expenses() {
  const [openAddModal, setOpenAddModal] = useState(false);

  const onOpenAddModal = () => setOpenAddModal(true);
  const onCloseAddModal = () => setOpenAddModal(false);

  return (
    <div>
      <div className="flex justify-end">
        <PrimaryButton
          onClick={onOpenAddModal}
          text="Add"
          iconName="PlusCircle"
        ></PrimaryButton>
      </div>
      <Modal
        classNames={{
          modal: "p-0 m-0 w-3/4",
        }}
        closeOnEsc={false}
        closeOnOverlayClick={false}
        showCloseIcon={false}
        open={openAddModal}
        onClose={onCloseAddModal}
        center
      >
        <h2 className="text-white text-xl bg-violet-950 text-center p-2">
          Add new expense
        </h2>
        <div className="text-center">WIP</div>
        <div className="flex justify-end p-2">
          <button
            className="bg-red-700 px-4 py-2 rounded text-white"
            onClick={() => setOpenAddModal(false)}
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}

export async function loader({ request }: { request: Request }) {
  await requireUserSession(request);
  return null;
}
