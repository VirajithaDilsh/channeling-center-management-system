import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";


const TableActionButtons = ({ onView, onEdit, onDelete, onSchedule, isActive }) => {
  return (
    <div className="flex gap-1 justify-center">

      <Button
        size="small"
        color="primary"
        onClick={onView}
        sx={{ textTransform: "none" }}
      >
        View
      </Button>

      <Button
        size="small"
        color="secondary"
        onClick={onEdit}
        sx={{ textTransform: "none" }}
      >
        Edit
      </Button>

    </div>
  );
};

export default TableActionButtons;
