import { View,Text,Image,Pressable,StyleSheet } from "react-native";
import { FONTS } from "../utils/fonts";
import { useNavigation } from "@react-navigation/native";


export default function WelcomeScreen() {
    const navigation = useNavigation(); 
    return(
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image
                source={require("../assets/branding/logo_large.png")}
                style={styles.mainlogo}
                accessible={true}
                accessibilityLabel="Main Logo"
                />
            </View>

            <View style={styles.titleContainer}>    
                    
                <Text style={styles.title}>
                    Welcome{'\n'}
                    to{'\n'}
                    Little Lemon
                </Text>

            </View>
                
                <Text style={styles.subtitle}>Your Mediterranean Escape</Text>

            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    {
                        backgroundColor: pressed ? "#F4CE14" : "#EE9972",
                    },
                ]}
                onPress={() => navigation.navigate ("Onboarding")} 
            >
                
                <Text style={styles.buttonText}>Get started</Text>

            </Pressable>

            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    { 
                        backgroundColor: pressed ? "#F4CE14" : "#EDEFEE",
                        marginTop: 20
                    }
                ]}
                onPress={() => navigation.navigate("Login")}
            >
                <Text style={[styles.buttonText, { color: '#333' }]}>Login</Text>
            </Pressable>
            
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: '#EDEFEE',
        justifyContent: "center",
        alignItems:"center",
        padding: 20,     
    },
    logoContainer:{
        maxHeight:120,
        marginBottom:20,
        justifyContent:"center"
    },
    mainlogo:{
        resizeMode: "contain",
        width: '80%',
        maxHeight:100,
        aspectRatio:2.4,
    },
    titleContainer: {
        backgroundColor: "#495E57",
        borderRadius: 12,
        paddingHorizontal:30,
        paddingVertical:15,
        marginBottom: 12
    },
    title:{
        fontFamily:FONTS.markaziTextMedium,
        fontSize: 64,
        textAlign: "center",
        color: "#F4CE14",
        lineHeight:70
                   
    },
    subtitle:{
        fontFamily:FONTS.markaziTextRegular,
        fontSize: 40,
        textAlign: "center",
        color: "#333333",
        marginBottom:40,
        lineHeight:46,
        paddingHorizontal:20
    },
    button: {
        paddingVertical: 18,
        paddingHorizontal: 24,
        borderRadius: 16,
        minWidth: 240, // Better for large screens
        alignItems: "center",
        backgroundColor: "#EE9972",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
        alignSelf: 'center',
    },
    buttonText:{
        fontFamily:FONTS.karlaMedium,
        fontSize:22,
        color:"white",
        textAlign:"center",
        letterSpacing:0.5
    },
    
})