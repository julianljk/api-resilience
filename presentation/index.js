// Import React
import React from "react";

// Import Spectacle Core tags
import {
  BlockQuote,
  Cite,
  Deck,
  Heading,
  ListItem,
  List,
  Quote,
  Slide,
  Text,
  S,
  Code,
  CodePane, 
  Image,
  Fit, 
  Fill,
  Layout
} from "spectacle";

// Import theme
import createTheme from "spectacle/lib/themes/default";
import createExtensionExample from 'raw-loader!../assets/createExtension.example';
import createExt from '../assets/createExt.jpg';
// Require CSS
require("normalize.css");

const theme = createTheme({
  primary: "white",
  secondary: "#1F2022",
  tertiary: "#03A9FC",
  quarternary: "#CECECE"
}, {
  primary: "Montserrat",
  secondary: "Helvetica"
});

export default class Presentation extends React.Component {
  render() {
    return (
      <Deck transition={["zoom", "slide"]} transitionDuration={500} theme={theme} contentWidth={1500}>
        <Slide transition={["zoom"]} bgColor="primary">
          <Heading size={1} fit caps lineHeight={1} textColor="secondary">
            API Resilience 
          </Heading>
          <Text margin="10px 0 0" textColor="tertiary" size={5} fit bold>
            Steps towards a (mostly) fault tolerant API 
          </Text>
        </Slide>
        <Slide transition={["fade"]} bgColor="primary">
          <Heading size={5} textColor="tertiary">Goals: Have Phoebe 2.0 operate completely (or partially) independant of client</Heading>
          <List>
            <ListItem>Assume that an internal user can hit the API with any parameters</ListItem>
            <ListItem>Assume that business rules regarding inserts/updates/deletes are enforced on the server-side (or database)</ListItem>
          </List>
        </Slide>
        <Slide transition={["fade"]} bgColor="primary">
          <Heading size={6} textColor="tertiary" caps>Any parameters</Heading>
              <Text margin="20px 0 0 0" textAlign="left">Types might not necessarily be right </Text>
              <Text margin="10px 0 80px 50px" textAlign="left" textSize="30">i.e. A string might be passed in where a number is expected </Text>
              <Text textAlign="left"><S type="bold">Considerations:</S></Text>
              <List margin="0 0 0 0">
                <ListItem>Is the API server well-equipped enough to handle these? (does the auto-casting cause unexpected results)</ListItem>
                <ListItem>Where do we handle these checks? (i.e. API Controller, BLL, EF repository)</ListItem>
              </List>
        </Slide>
        <Slide transition={["fade"]} bgColor="primary">
          <Heading size={6} textColor="tertiary" caps>Server-side business rules</Heading>
              <Text margin="20px 0 0 0" textAlign="left">
                Currently, we enforce a large majority of the business rules on the client. In order to move towards a resilient API we need to 
                move some of the logic back to the server.
              </Text>
              <Text margin="20px 0 0 0" textAlign="left"><S type="bold">General Design Principles:</S></Text>
              <Text margin="20px 0 0 50px" textAlign="left"></Text> 
              <List margin="0 0 0 0">
                <ListItem textSize="26">Whenever possible, we handle invalid inputs with SQL throws (making extensive use of constraints)</ListItem>
                <ListItem textSize="26">Where do we handle these checks? (i.e. API Controller, BLL, EF repository, SQL CHECK statements)</ListItem>
              </List>
              <Text margin="20px 0 0 0" textAlign="left"><S type="bold">Potential Issues:</S></Text>
              <Text margin="20px 0 0 50px" textAlign="left"></Text>
              <List margin="0 0 0 0">
                <ListItem textSize="26">Keeping validation on the client in sync with validation on the server. (making sure that the client's validation rules is equal to or a subset of the server's validation rules)</ListItem>
                <ListItem textSize="26">Making sure .NET's API casting system doesn't cause misinterpretations (passing a string to a non-nullable int sets a request parameter to 0)</ListItem>
              </List>
        </Slide>
        <Slide transition={["fade"]} bgColor="primary">
          <Layout>
            <Image src={createExt} fit>
            </Image>
              <List margin="0 0 0 30px" fill>
                <ListItem margin="0 0 10px 0" textSize="16">CompanyID = FK Contraints</ListItem>
                <ListItem margin="0 0 10px 0" textSize="16">ProjectID = <Code textSize="16">(projectID, companyID) => [projectID in vCompanyExtension.where(CompanyID = t.companyID).select(projectID).unique() || null]</Code></ListItem>
                <ListItem margin="0 0 10px 0" textSize="16">ContractID = <Code textSize="16">(contractID, companyID, projectID) => [contractID in tContract.where(companyID = t.toCompanyID AND projectID = t.projectID).select(contractID) || null]</Code></ListItem>
                <ListItem margin="0 0 10px 0" textSize="16">CompanyLocationID = <Code textSize="16">(companyLocationID, companyID) => [CompanyLocationID in tLocation.where(companyID = t.companyID).select(locationID)]</Code></ListItem>
                <ListItem margin="0 0 10px 0" textSize="16">ContactID = FK Contraints (we get this from the server anyway)</ListItem>
                <ListItem margin="0 0 10px 0" textSize="16">ExpenseAllowanceTypeID = FK Contraints </ListItem>
                <ListItem margin="0 0 10px 0" textSize="16">FeeAndExpenseCombined = (feeAndExpenseCombined, expenseAllowanceTypeID) => [expenseAllowanceTypeID === "defined" ? feeAndExpenseCombined == null : feeAndExpenseCombined != null] </ListItem>
                <ListItem margin="0 0 10px 0" textSize="16">ExtensionName = No Contraints </ListItem>
                <ListItem margin="0 0 10px 0" textSize="16">ExtensionNbr = No Contraints (We cast it to <Code textSize="16">NVARCHAR(2)</Code>, throws if is there is duplicate )</ListItem>
                <ListItem margin="0 0 10px 0" textSize="16">ExtensionTypeID = <Code textSize="16">(extensionTypeID) => [extensionTypeID in tExtensionType.where(ExtensionTypeName in [Potential, Committed].select(ExtensionTypeID))]</Code></ListItem>
                <ListItem margin="0 0 10px 0" textSize="16">FeeBasisID = <Code textSize="16">(feeBasisID) => [feeBasisID in tFeeBasis.where(IsActive).select(FeeBasisID)] </Code></ListItem>
                <ListItem margin="0 0 10px 0" textSize="16">Multiple = <Code textSize="16">(multiple, feeBasisID) => [feeBasisID NOT IN tFeeBasis.where(FeeBasisName in [Time and Material, Hourly NTE]).select(FeeBasisID) || multiple] </Code></ListItem>
                <ListItem margin="0 0 10px 0" textSize="16">ProjectManagerContactID = <Code textSize="16">(projectManagerContactID, companyID) => [projectManagerContactID in tContact.where(companyID = t.companyID).select(contactID)] </Code></ListItem>
                <ListItem margin="0 0 10px 0" textSize="16">GroupCoordinatorContactID = <Code textSize="16">(groupCoordinatorContactID, companyID) => [groupCoordinatorContactID in tContact.where(companyID = t.companyID).select(contactID) || groupCoordinatorContactID == NULL] </Code></ListItem>
                <ListItem margin="0 0 10px 0" textSize="16">ProjectName = No Contraints </ListItem>
                <ListItem margin="0 0 10px 0" textSize="16">CoreTeamID = <Code textSize="16">(coreTeamID, companyID) => coreTeamID in tCoreTeam.where(companyID = t.companyID).select(coreTeamID) (needs to default to unknown on the client or be null) </Code></ListItem>
                <ListItem margin="0 0 10px 0" textSize="16">DivisionID = <Code textSize="16">(divisionID, companyID) => divisionID in tDivision.where(companyID = t.companyID).select(divisionID) (needs to default to N/A on the client or be null ) </Code></ListItem>
              </List>
          </Layout>
        </Slide>
        <Slide transition={["fade"]} bgColor="primary">
          <Heading size={6} textColor="tertiary" caps>Solutions: Enforce Business Rules on the Database</Heading>
              <Text margin="20px 0 0 0" textAlign="left">
                Currently, we enforce a large majority of the business rules on the client. In order to move towards a resilient API we need to 
                move some of the logic back to the server.
              </Text>
              <Text margin="20px 0 0 0" textAlign="left"><S type="bold">Two Options:</S></Text>
              <Text margin="20px 0 0 50px" textAlign="left"></Text> 
              <List margin="0 0 0 0">
                <ListItem textSize="26">Triggers (nope)</ListItem>
                <ListItem textSize="26"><Code>CHECK</Code> Constraints</ListItem>
              </List>
              <Text margin="20px 0 0 0" textAlign="left"><S type="bold">Potential Issues:</S></Text>
              <Text margin="20px 0 0 50px" textAlign="left"></Text>
              <List margin="0 0 0 0">
                <ListItem textSize="26">Keeping validation on the client in sync with validation on the server. (making sure that the client's validation rules is equal to or a subset of the server's validation rules)</ListItem>
                <ListItem textSize="26">Making sure .NET's API casting system doesn't cause misinterpretations (passing a string to a non-nullable int sets a request parameter to 0)</ListItem>
              </List>
        </Slide>
        <Slide transition={["fade"]} bgColor="primary">
          <Heading size={6} textColor="tertiary" caps>Solutions: Enforce Business Rules Server Side (BLL)</Heading>
          <Text margin="20px 0 0 50px">Similar to how we handle quick search rules (BLL -> DAL )</Text> 
        </Slide>
        <Slide transition={["fade"]} bgColor="primary">
          <Heading size={6} textColor="tertiary" caps>Next Steps:</Heading>
          <Text margin="20px 0 0 0" textAlign="left">
            Depending on which route we go, I'll work with someone on developing the necessary infrastructure (or User Stories) to enforce this rules, starting with the New Project Wizard entity as a pilot. 
          </Text>
        </Slide>
      </Deck>
    );
  }
}
