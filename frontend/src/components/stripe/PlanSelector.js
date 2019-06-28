import React from "react";
import {createMuiTheme, MuiThemeProvider} from "@material-ui/core";
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from "@material-ui/core/RadioGroup";

export class PlanSelector extends React.Component {

    theme = createMuiTheme({
        palette: {
            type: 'dark',
        },
    });

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <MuiThemeProvider theme={this.theme}>
                <RadioGroup
                    aria-label="gender"
                    style={{justifyContent: "center", alignItems: "center"}}
                    value={this.props.value}
                    onChange={(_, value) => {
                        this.props.onChange(value);
                    }}
                >
                    <FormControlLabel value="MONTHLY" style={{width: 150, height: 40}}
                                      control={<Radio
                                          checked={this.props.value === "MONTHLY"}/>}
                                      label="$29.99/month"/>
                    <FormControlLabel value="YEARLY" style={{width: 150, height: 40}}
                                      control={<Radio
                                          checked={this.props.value === "YEARLY"}/>}
                                      label="$300.00/year"/>
                </RadioGroup>
            </MuiThemeProvider>
        )
    }
}

export default PlanSelector
