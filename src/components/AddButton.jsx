import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";

const AddButton = ({
                       label = "Add",
                       onClick,
                       bgColor = "#1976d2"
                   }) => {
    return (
        <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onClick}
            sx={{
                backgroundColor: bgColor,
                textTransform: "none",
                "&:hover": {
                    backgroundColor: bgColor
                }
            }}
        >
            {label}
        </Button>
    );
};

export default AddButton;