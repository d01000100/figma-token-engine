## Just base variables, no modes, (1 collection)

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

            Let's see if the attributes are enough for our existing transforms
      2. Put in result object 
         1. Divide the name by /
         2. Insert or create levels on the result object, starting with collection and for each part of the divided name
         3. Insert token on the final level

## Styles