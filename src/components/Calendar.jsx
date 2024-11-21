import { Box, Typography, Alert } from "@mui/material";
import Item from "./YItem";
import { useApp } from "../ThemedApp";
import { useQuery } from "react-query";

const api = import.meta.env.VITE_YENZAY_API;

export default function Calendar() {

    const { calendarValue } = useApp();

    const { isLoading, isError, error, data } = useQuery(["yenzay", calendarValue], async ({ queryKey }) => {
        const [_, calendarValue] = queryKey
        let apiUrl = `${api}/day/today.json`;

        /** calendarValue change && not today date */
        if (calendarValue && calendarValue.format("YYYY/MM/DD") !== new Date().toLocaleDateString("ja-JP", {
            year: "numeric", month: "2-digit",
            day: "2-digit"
        })) {
            apiUrl = `${api}/month/${calendarValue.format("YYYYMM")}.json`;
        }
        const res = await fetch(apiUrl);
        return res.json();
    }, {
        retry: 1,
    });

    if (data && calendarValue) {
        data.Items = data.Items.filter(x => x.DayTime.indexOf(`${calendarValue.format("DD ")}`) > -1);
    }

    if (isLoading) {
        return <Box style={styles.error}>Loading...</Box>
    }

    if (isError || !data || data.Items.length === 0) {
        return (
            <Box style={styles.error}>
                <Alert severity="warning">No Data</Alert>
            </Box>
        );
    }

    return (
        <Box>
            <Typography style={{ ...styles.text.label, ...styles.text.label.SimulationResult }}>{data.Items[0].YearMonth}/{data.Items[0].DayTime}</Typography>
            <Typography style={styles.text.label}>{data.Items[0].YearMonth}/{data.Items[0].DayTime.split(` `)[0]}</Typography>

            {
                data.Items.slice().reverse().map(item => {
                    return (
                        <Item
                            key={item.YearMonth + item.DayTime}
                            item={item}
                        />
                    );
                })
            }
        </Box>
    );

}

const styles = {
    text: {
        label: {
            fontWeight: "bold",
            color: "rgb(249 19 161)",
            paddingBottom: 6,
            position: "sticky",
            top: 120,
            zIndex: 20,
            textAlign: "center",
            SimulationResult: {
                color: "#aaa",
                position: "fixed",
                top: 120,
                left: 46,
                right: 0,
                margin: "auto",
            }
        },
    },
    error: {
        height: 10000,
        textAlign: "center",
    }
}