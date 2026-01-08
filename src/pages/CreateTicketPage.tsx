import { Box, Paper, Typography } from '@mui/material';

export default function CreateTicketPage() {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Create Ticket
            </Typography>
            <Paper sx={{ p: 5, textAlign: 'center' }}>
                <Typography variant="h5" color="text.secondary">
                    Coming Soon
                </Typography>
                <Typography>
                    This feature is under development.
                </Typography>
            </Paper>
        </Box>
    );
}
