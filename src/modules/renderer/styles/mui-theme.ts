import { createMuiTheme } from '@material-ui/core/styles';
import cyan from '@material-ui/core/colors/cyan';
import pink from '@material-ui/core/colors/pink';
import grey from '@material-ui/core/colors/grey';
import blueGrey from '@material-ui/core/colors/blueGrey';

export const LIGHT = createMuiTheme({
    typography: {
        fontFamily: `'Open Sans', sans-serif`,
        fontSize: 14,
        htmlFontSize: 14,
    },
    palette: {
        primary: cyan,
        secondary: pink
    }
});

/*
        primary1Color: Colors.cyan500,
        primary2Color: Colors.cyan700,
        primary3Color: Colors.grey400,
        accent1Color: Colors.pinkA200,
        accent2Color: Colors.grey100,
        accent3Color: Colors.grey500,
        textColor: Colors.blueGrey900,
        secondaryTextColor: Colors.blueGrey600,
        alternateTextColor: Colors.white,
        canvasColor: Colors.white,
        borderColor: Colors.grey200,
        disabledColor: Colors.grey500, //Colors.grey200,
        pickerHeaderColor: Colors.cyan500,
        shadowColor: Colors.fullBlack

*/
