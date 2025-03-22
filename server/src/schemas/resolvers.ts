import { User } from '../models/index.js';
import { signToken, AuthenticationError } from '../services/auth.js';



const resolvers = {
  Query: {
    me: async (_parent: unknown, _args: unknown, context: Context): Promise<Profile | null> => {
        if (context.user) {
          // If user is authenticated, return their profile
          return await Profile.findOne({ _id: context.user._id });
        }
        // If not authenticated, throw an authentication error
        throw new AuthenticationError('Not Authenticated');
      },
    },
  

  Mutation: {
    addUser: async (_parent: unknown, { username,email,password }: any): Promise<{ token: string; profile: Profile }> => {
      // Create a new profile with provided name, email, and password
      const user = await Profile.create({ ...input });
      // Sign a JWT token for the new profile
      const token = signToken(profile.name, profile.email, profile._id);

      return { token, profile };
    },

    login: async (_parent: unknown, { email, password }: { email: string; password: string }): Promise<{ token: string; profile: Profile }> => {
      // Find a profile by email
      const profile = await Profile.findOne({ email });

      if (!profile) {
        // If profile with provided email doesn't exist, throw an authentication error
        throw AuthenticationError;
      }

      // Check if the provided password is correct
      const correctPw = await profile.isCorrectPassword(password);

      if (!correctPw) {
        // If password is incorrect, throw an authentication error
        throw new AuthenticationError('Not Authenticated');
      }

      // Sign a JWT token for the authenticated profile
      const token = signToken(profile.name, profile.email, profile._id);
      return { token, profile };
    },

    
  },
};

export default resolvers;
