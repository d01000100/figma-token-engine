# variables2json parsing

This file describes the algorithm to parse variables2json exports, from simple cases to the most complex.

The version that matches the code is the last one. I leave all the other versions to have a more thorough understanding on how the algorithm was made.

## Just base variables, no alias, no modes, (1 collection)

1. For each colection:
   1. Take the name of the collection
   2. Count the modes (1)
   3. If there's 1 mode, ignore it
   4. For each variable in the mode:
      1. Create StyleDictionary token
         1. Copy value
         2. Determine StyleDictionary compatible attributes
            1. type === "color" => attributes.category = color
            2. type === "number" => attributes.category = size
         3. Determinte TokenType
            1. "color" = Color

            **!! No way to determine further detail on TokenType. We would have to rely on name convention !!**

            ~~Let's see if the attributes are enough for our existing transforms~~ So far, is enough for variables and we can still rely on TokenType for other inputs
      2. Put in result object
         1. Divide the name by /
         2. Insert or create levels on the result object, starting with collection and for each part of the divided name
         3. Insert token on the final level

## Just variables, no styles, with alias, no modes, (2 collections)

1. For each colection:
   1. Take the name of the collection
   2. Count the modes (1)
   3. If there's 1 mode, ignore it
   4. For each variable in the mode:
      1. Create StyleDictionary token
         1. Determine StyleDictionary compatible attributes
            1. type === "color" => attributes.category = color
            2. type === "number" => attributes.category = size
         2. If not alias, copy value
         3. If alias:
            1. Divide referenced token name by /
            2. Create location of referenced token with collection and divided name
            3. If referenced token already parsed, copy value
            4. If not, add this token to "pending" list
      2. Put in result object
         1. Divide the name by /
         2. Insert or create levels on the result object, starting with collection and for each part of the divided name
         3. Insert token on the final level
   5. For each variable in pending, repeat until no variables in pending anymore

## Just variables, no styles, with alias, 2 modes, (2 collections)

1. For each colection:
   1. Take the name of the collection
   2. Count the modes
   3. If there's 1 mode, ignore it
   4. If there's more than 1, store the name of the mode
   5. For each variable in the mode:
      1. Create StyleDictionary token
         1. Determine StyleDictionary compatible attributes
            1. type === "color" => attributes.category = color
            2. type === "number" => attributes.category = size
         2. If not alias, copy value
         3. If alias:
            1. Divide referenced token name by /
            2. Create location of referenced token with collection and divided name
            3. If referenced token already parsed, copy value
            4. If not, add this token to "pending" list
      2. Put in result object
         1. Divide the name by /
         2. Insert or create levels on the result object, starting with collection, mode (if there's more than 1) and for each part of the divided name
         3. Insert token on the final level
   6. For each variable in pending, repeat until no variables in pending anymore

## Variables and Styles, with alias, n modes, (n collections)

1. For each colection:
   1. Take the name of the collection
   3. For the rest of the collections
   4. Count the modes
   5. If there's 1 mode, ignore it
   6. If there's more than 1, store the name of the mode
   7. For each variable in the mode:
      1. *Check if the type is either typography, effect or grid*
         1. *If it's Typography, parse it using the styles parser*
         2. *If it's Effects, parse it using the styles parser*
         3. *If it's Grids, ignore*
      2. *If it's any other type,* Create StyleDictionary token
         1. Determine StyleDictionary compatible attributes
            1. type === "color" => attributes.category = color
            2. type === "number" => attributes.category = size
         2. If not alias, copy value
         3. If alias:
            1. Divide referenced token name by /
            2. Create location of referenced token with collection and divided name
            3. If referenced token already parsed, copy value
            4. If not, add this token to "pending" list
      3. Put in result object
         1. Divide the name by /
         2. Insert or create levels on the result object, starting with collection, mode (if there's more than 1) and for each part of the divided name
         3. Insert token on the final level
   8. For each variable in pending, repeat until no variables in pending anymore

## Variables and Styles, with alias, n modes, (n collections) with external references

### Requirements

- Tokens cannot have repeated names (considering the levels). Not even inside different collections or files

### Strategy

- Each alias variable has the name of the variable it references, no collection or modes
- ¿Do we need to assume the variable names are unique?

  If they're not, we could not identify what collection/mode do they come from
- **We need to merge the two files before entering the parser**
  - We just need to append the collections array on each one
- We could search the variable name on the existing parsed variables and get the modes and collections of matches (they are already added when we process the variables)
- For each match, we create a different token, and add the collection and mode to their route

- **¿What happens if an alias is referrencing another alias that hasn't been resolved yet?**
  - It wouldn't be on the _resolved_ array
  - ¿Could we make a map/dictionary of variables first by name?
    - And check there if there's a resolved value
    - Also, updating the value when resolving

- Consider using the referenced collection, if we have it
  - Fetch the variable from the Record, for that specific collection

### Algorithm

1. **First pass**
   1. Add each variable to a **variableRecord**, that will keep track if a variable has been resolved or not.
     - Each variable should have:
       - name
       - isAlias
       - collection
       - mode (if there's more than 1)
       - value, either explicit or as a reference to other variable
2. For each colection:
   1. Count the modes
   2. If there's 1 mode, ignore it
   3. If there's more than 1, store the name of the mode
   4. For each variable in the mode:
      1. If alias: **Run the resolving single alias token algorithm**
      2. If explicit:
         1. Check if the type is either typography, effect or grid
            1. If it's Typography, parse it using the styles parser
            2. If it's Effects, parse it using the styles parser
            3. If it's Grids, ignore
         2. If it's any other type, Create StyleDictionary token
            1. Determine StyleDictionary compatible attributes
               1. type === "color" => attributes.category = color
               2. type === "number" => attributes.category = size
            2. If not alias, copy value
         3. Put in result object
            1. Divide the name by /
            2. Insert or create levels on the result object, starting with collection, mode (if there's more than 1) and for each part of the divided name
            3. Insert token on the final level
   5. For each variable in pending, repeat **alias resolving algorithm** until no variables in pending anymore or pending array didn't change from the last pass

#### Resolving single alias token

1. Store the collection as `baseCollection`
2. If the collection has more than 1 mode, store the Mode as `baseMode`
3. Search the **variableRecord** for variables with the referred name
   1. If no matches, **log warning about no matches** **EXIT**
   2. If some matches are alias, add alias variable to pending **EXIT**
   3. If all the matches are explicit, remove og variable entry from the **variableRecord**
   4. Store if there's more than 1 collection or modes on the results
   5. For each match:
      1. If it's an explicit value, extract `collection`, `mode`, `isAlias` and `value`
      2. Create the route
         1. Add the `baseCollection` and the `baseMode` (if there are more than 2 modes in the og var)
         2. ~~If in the matches, there are more than 1 collection, we add the name of the collection~~
         3. If in the matches, there are more than 1 mode, we add the modes of the match
         4. Split og name by divider
      3. Create a new token with:
         ```ts
         {
           route,
           value: referred.value,
           collection, // Maybe for filtering purposes
           // For filtering purposes
           modes: [
            ogMode /* If the og variable belongs to more than one mode */,
            matchMode /* If the matches have more than 1 mode */
          ],
         }
         ```
      4. Add it to the result
      5. ~~Remove the variable from pending (if it's there)~~ (The pending array will be deleted every time we process it)
      6. Update **VariableRecord**:
         1. Add the variable again, with:
            1. isAlias = false
            2. The referred variable's value
            3. ogCollection
            4. modes: [
            ogMode /* If the og variable belongs to more than one mode */,
            ...matchModes /* If the matches have more than 1 mode */
          ]

#### Variable Record

**Operations**

- addVariable(v : Variable)
- removeVariable(v : Variable)

  It removes the variable from the record that matches with v on collection, mode, and name
- updateVariable(v : Variable)

  It updates the variable on the record that matches with v on collection, mode, and name and replaces the rest of v's properties
- searchReferences(name : string, collection? : string) : Variable[]