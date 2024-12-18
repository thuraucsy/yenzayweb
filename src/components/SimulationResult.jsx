import { Typography, Box } from "@mui/material";
import YenOrGoldButton from "./YenOrGoldButton";
import { useApp } from "../ThemedApp";
import { useQuery } from "react-query";
import { useEffect } from "react";
import { getCurrencyFormatter } from "../ThemedApp";

const api = import.meta.env.VITE_YENZAY_API;

function CalculatedResult({ yItem, yData }) {
    let handlingFee = 0;
    if (yData.simulator.atmFeeCheck) {
        handlingFee += yData.simulator.sbiPricingObj[yData.simulator.atmType] ? Number(yData.simulator.sbiPricingObj[yData.simulator.atmType]) : 0;
    }

    if (yData.simulator.remitFeeCheck) {
        handlingFee += yData.simulator.sbiPricingObj.remit ? Number(yData.simulator.sbiPricingObj.remit) : 0;
    }

    if (yData.simulator.preferMethod === "y2k") {
        return (
            <Box style={styles.balance}>
                <Typography style={styles.text.label}>K</Typography>
                <Typography style={styles.text.amount}>{yItem ? getCurrencyFormatter(Math.floor((Number(yData.simulator.y2k.value - handlingFee) * Number(yItem.MMKRatePerYen)))) : ""}</Typography>
                <Typography style={styles.text.label}>/&nbsp;&nbsp;¥{yItem ? getCurrencyFormatter(yData.simulator.y2k.value) : ""}</Typography>
            </Box>
        );    
    }


    return (
        <Box style={styles.balance}>
            <Typography style={styles.text.label}>¥</Typography>
            <Typography style={styles.text.amount}>{yItem ? getCurrencyFormatter(Math.ceil((Number(yData.simulator.k2y.value) / Number(yItem.MMKRatePerYen))) + handlingFee) : ""}</Typography>
            <Typography style={styles.text.label}>/&nbsp;&nbsp;K{yItem ? getCurrencyFormatter(yData.simulator.k2y.value) : ""}</Typography>
        </Box>
    );
}

export default function SimulationResult() {
    const { yItem, setYItem, yData } = useApp();
    let apiUrl = `${api}/day/today.json`;
    const { isLoading, isError, error, data } = useQuery("yenzay", async () => {
        const res = await fetch(apiUrl);
        return res.json();
    }, {
        retry: 1,
    });

    useEffect(() => {
        if (data && data.Items) {
            setYItem(data.Items.slice().reverse()[0]);
        }
    }, [data]);

    const handlingChargesLabel = () => {
        if (yData.simulator.atmFeeCheck && yData.simulator.remitFeeCheck) {
            return `(Incl. ATM, Remit fees)`;
        } else if (yData.simulator.atmFeeCheck) {
            return `(Incl. ATM fee)`;
        } else if (yData.simulator.remitFeeCheck) {
            return `(Incl. Remit fee)`;
        }
    }

    return (
        <Box style={styles.banner}>
            <Box>
                <Typography style={styles.text.label}>Simulation Result {handlingChargesLabel()}</Typography>

                <CalculatedResult yItem={yItem} yData={yData} />
                <Typography sx={{
                    fontWeight: "bold",
                    fontStyle: "italic",
                    color: "#f5dbdb"
                }}>{yItem.YearMonth}/{yItem.DayTime} ({yItem.MMKRatePerYen})</Typography>
            </Box>
            {/* <Box style={styles.yenOrGold}>
                <YenOrGoldButton />
            </Box> */}
        </Box>
    );
}

const styles = {
    banner: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 30,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        backgroundColor: "rgb(244, 72, 72)",
        position: "sticky",
        top: -1,
        zIndex: 10,
    },
    balance: {
        marginTop: 12,
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
        display: "flex",
    },
    yenOrGold: {
        alignItems: "flex-end",
    },
    text: {
        label: {
            fontWeight: "bold",
            color: "#f5dbdb",
        },
        amount: {
            fontWeight: "bold",
            fontSize: 35,
            color: "#fff",
        },
        growth: {
            color: "#6f6",
        },
    },
};
