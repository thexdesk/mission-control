require 'rack'
require './src/functions'

# @precondition  -> variables do not exist in header
# @param text    -> text to be parsed
# @return        -> undefined
# @postcondition -> session variables are set
def parse_sections(text)
  # parse the full post into individual sections
  text.scan(
    %r{\[\]\(/# MC // sec (.*)\)\n((?:.*\n)*?)(?=\[\]\(/# MC // sec .*\))}
  ).each do |name, content|
    # events get parsed later on
    session[name.downcase.to_sym] = content.strip
  end

  parse_events session[:events] if session.key?(:events) \
                                && session[:events].length > 49
end

# @param events  -> raw text of events section
# @return        -> undefined
# @postcondition -> session[:events] is set properly
def parse_events(events)
  unposted, posted = events.split('### Live Updates', 2)

  session[:events] = []

  # parse unposted events
  unposted.scan(%r{\[\]\(\/# MC // row (\d+) \| (.*) \| (.*) \|\)}) \
  do |row, time, message|
    session[:events][row.to_i] = [false, time.gsub('\)', ')'),
                                  message.gsub('\)', ')')]
  end

  # parse posted events
  # [33..-1] strips header
  posted[33..-1].scan(%r{\| \[\]\(/# MC // row (\d+)\) (.*) \| (.*) \|}) \
  do |row, time, message|
    session[:events][row.to_i] = [true, time, message]
  end
end

# @precondition  -> variables exist in header
# @param text    -> the full text to be parsed, including unimportant sections
# @return        -> [{variables}, initial text with variables stripped]
# @postcondition -> session variables are set
def parse_vars(text)
  # isolate the variables string
  vars, sections = text.split('[](/# MC // END VARS)', 2)

  # parse the variables & set in session variables
  vars.scan(%r{\[\]\(\/# MC // let (.*) = (.*)\)}) do |name, value|
    session[name.downcase.to_sym] = value == 'null' ? nil : value
  end

  sections.strip
end

# @param url     -> valid URL to reddit post
# @return        -> boolean if recovery succeeded
# @postcondition -> session variables are set if recovery succeeded
def recover_post(url)
  id = %r{(?:www).reddit.com/r/(?:.*?)/comments/([0-9a-z]{6})}.match(url)
  post = (request.env['redd.session'].from_ids ["t3_#{id[1]}"].to_ary)[0]

  # require self post
  return false unless post.is_self

  # require OP to be current user
  return false unless request.env['redd.session'].me.name != post.author

  # set everything into session variables
  parse_sections parse_vars post.selftext
  session[:post] = post.id

  true
end
