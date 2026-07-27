import Button from "@mui/material/Button";

const AddButton = ({
                       label = "Add",
                       onClick,
                       color = "primary"
                   }) => {
    return (
        <Button
            variant="contained"
            color={color}
            onClick={onClick}
        >
            {label}
        </Button>
    );
};

export default AddButton;